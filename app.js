// --- STORAGE KEYS ---
const LOCAL_STORAGE_KEY = 'takhasus_quran_evaluations_v2';
const MASTER_SANTRI_KEY = 'takhasus_master_santri_v2';
const MASTER_PENGUJI_KEY = 'takhasus_master_penguji_v2';
const CURRENT_USER_KEY = 'takhasus_current_user_v2';
const PRESENSI_STORAGE_KEY = 'takhasus_quran_presensi_v2';

let evaluations = [];
let masterSantri = [];
let masterPenguji = [];
let presensiRecords = [];
let isSidebarOpen = false;
let showHijriDate = false;

// DAFTAR 114 SURAT AL-QUR'AN
const daftarSuratQuran = [
    "1. Al-Fatihah", "2. Al-Baqarah", "3. Ali 'Imran", "4. An-Nisa'", "5. Al-Ma'idah",
    "6. Al-An'am", "7. Al-A'raf", "8. Al-Anfal", "9. At-Taubah", "10. Yunus",
    "11. Hud", "12. Yusuf", "13. Ar-Ra'd", "14. Ibrahim", "15. Al-Hijr",
    "16. An-Nahl", "17. Al-Isra'", "18. Al-Kahf", "19. Maryam", "20. Tha-Ha",
    "21. Al-Anbiya'", "22. Al-Hajj", "23. Al-Mu'minun", "24. An-Nur", "25. Al-Furqan",
    "26. Asy-Syu'ara'", "27. An-Naml", "28. Al-Qasash", "29. Al-'Ankabut", "30. Ar-Rum",
    "31. Luqman", "32. As-Sajdah", "33. Al-Ahzab", "34. Saba'", "35. Fathir",
    "36. Ya-Sin", "37. Ash-Shaffat", "38. Shad", "39. Az-Zumar", "40. Ghafir",
    "41. Fussilat", "42. Asy-Syura", "43. Az-Zukhruf", "44. Ad-Dukhan", "45. Al-Jatsiyah",
    "46. Al-Ahqaf", "47. Muhammad", "48. Al-Fath", "49. Al-Hujurat", "50. Qaf",
    "51. Adz-Dzariyat", "52. Ath-Thur", "53. An-Najm", "54. Al-Qamar", "55. Ar-Rahman",
    "56. Al-Waqi'ah", "57. Al-Hadid", "58. Al-Mujadilah", "59. Al-Hasyr", "60. Al-Mumtahanah",
    "61. Ash-Shaff", "62. Al-Jumu'ah", "63. Al-Munafiqun", "64. At-Taghabun", "65. Ath-Thalaq",
    "66. At-Tahrim", "67. Al-Mulk", "68. Al-Qalam", "69. Al-Haqqah", "70. Al-Ma'arij",
    "71. Nuh", "72. Al-Jin", "73. Al-Muzzammil", "74. Al-Muddatstsir", "75. Al-Qiyamah",
    "76. Al-Insan", "77. Al-Mursalat", "78. An-Naba'", "79. An-Nazi'at", "80. 'Abasa",
    "81. At-Takwir", "82. Al-Infitar", "83. Al-Muthaffifin", "84. Al-Insyiqaq", "85. Al-Buruj",
    "86. Ath-Thariq", "87. Al-A'la", "88. Al-Ghasyiyah", "89. Al-Fajr", "90. Al-Balad",
    "91. Asy-Syams", "92. Al-Lail", "93. Adh-Dhuha", "94. Asy-Syarh", "95. At-Tin",
    "96. Al-'Alaq", "97. Al-Qadr", "98. Al-Bayyinah", "99. Az-Zalzalah", "100. Al-'Adiyat",
    "101. Al-Qari'ah", "102. At-Takatsur", "103. Al-'Asr", "104. Al-Humazah", "105. Al-Fil",
    "106. Quraisy", "107. Al-Ma'un", "108. Al-Kautsar", "109. Al-Kafirun", "110. An-Nasr",
    "111. Al-Lahab", "112. Al-Ikhlas", "113. Al-Falaq", "114. An-Nas"
];

// Sesi Pengguna Aktif
let currentUser = {
    role: '',
    name: '',
    kelompok: ''
};

// Master Data Default (Masing-masing Guru punya Password)
const defaultSantri = [
    { id: 's_1', nama: 'Muhammad Al-Fatih', nis: 'TKH-2026-012', kelompok: "Takhasus 'Ulya (Tingkat Lanjut)" },
    { id: 's_2', nama: 'Aisyah Humaira', nis: 'TKH-2026-045', kelompok: 'Takhasus Wustha (Tingkat Menengah)' },
    { id: 's_3', nama: 'Abdullah Azzam', nis: 'TKH-2026-001', kelompok: 'Takhasus Ula (Tingkat Dasar)' }
];

const defaultPenguji = [
    { id: 'p_1', nama: 'Ust. Ahmad Dahlan, M.Ag', kelompok: 'Takhasus Ula (Tingkat Dasar)', password: '123' },
    { id: 'p_2', nama: 'Ustadzah Fatimah, S.Pd.I', kelompok: 'Takhasus Wustha (Tingkat Menengah)', password: '123' },
    { id: 'p_3', nama: 'Ust. Ahmad Fauzi, Lc.', kelompok: "Takhasus 'Ulya (Tingkat Lanjut)", password: '123' }
];

document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    startClockAndWidget();
});

window.onload = function() {
    const tglInput = document.getElementById('tglEvaluasi');
    if (tglInput) tglInput.value = new Date().toISOString().split('T')[0];

    const presensiTgl = document.getElementById('presensiTanggal');
    if (presensiTgl) presensiTgl.value = new Date().toISOString().split('T')[0];

    populateSuratDropdowns();
    loadMasterData();
    loadDataFromStorage();
    loadPresensiFromStorage();
    checkUserSession();

    if (window.lucide) lucide.createIcons();

    calculateHafalanScore();
    calculateMurajaahScore();
    calculateAdabScore();
};

function populateSuratDropdowns() {
    const ziyadahSelect = document.getElementById('ziyadah_surat');
    const murajaahSelect = document.getElementById('murajaah_surat');

    let options = '<option value="">-- Pilih Surat --</option>';
    daftarSuratQuran.forEach(s => {
        options += `<option value="${s}">${s}</option>`;
    });

    if (ziyadahSelect) ziyadahSelect.innerHTML = options;
    if (murajaahSelect) murajaahSelect.innerHTML = options;
}

// --- MASTER DATA & DROPDOWN AUTO-REPAIR ---
function loadMasterData() {
    const santriStored = localStorage.getItem(MASTER_SANTRI_KEY);
    masterSantri = santriStored ? JSON.parse(santriStored) : defaultSantri;

    const pengujiStored = localStorage.getItem(MASTER_PENGUJI_KEY);
    let loadedPenguji = pengujiStored ? JSON.parse(pengujiStored) : defaultPenguji;

    // Pastikan seluruh penguji memiliki Password dan Kelompok
    masterPenguji = loadedPenguji.map(p => {
        if (!p.kelompok) {
            const def = defaultPenguji.find(d => d.nama === p.nama);
            p.kelompok = def ? def.kelompok : 'Takhasus Ula (Tingkat Dasar)';
        }
        if (!p.password) {
            const def = defaultPenguji.find(d => d.nama === p.nama);
            p.password = def ? def.password : '123456';
        }
        return p;
    });

    localStorage.setItem(MASTER_SANTRI_KEY, JSON.stringify(masterSantri));
    localStorage.setItem(MASTER_PENGUJI_KEY, JSON.stringify(masterPenguji));

    populateMasterDropdowns();
    renderMasterTables();
}

function populateMasterDropdowns() {
    const selSantri = document.getElementById('selectSantri');
    const selPenguji = document.getElementById('selectPenguji');
    const loginPenguji = document.getElementById('loginSelectPenguji');

    if (loginPenguji) {
        loginPenguji.innerHTML = '<option value="">-- Pilih Nama Guru --</option>';
        masterPenguji.forEach(p => {
            loginPenguji.innerHTML += `<option value="${p.nama}">${p.nama}</option>`;
        });
    }

    if (selSantri) {
        selSantri.innerHTML = '<option value="">-- Pilih Santri Binaan --</option>';
        
        let filteredSantri = masterSantri;
        if (currentUser.role === 'guru' && currentUser.kelompok) {
            filteredSantri = masterSantri.filter(s => s.kelompok && s.kelompok.trim() === currentUser.kelompok.trim());
        }

        if (filteredSantri.length === 0) {
            selSantri.innerHTML = '<option value="">(Belum Ada Santri di Kelompok Ini)</option>';
        } else {
            filteredSantri.forEach(s => {
                selSantri.innerHTML += `<option value="${s.id}">${s.nama}</option>`;
            });
        }
    }

    if (selPenguji) {
        selPenguji.innerHTML = '<option value="">-- Pilih Penguji --</option>';
        masterPenguji.forEach(p => {
            selPenguji.innerHTML += `<option value="${p.nama}">${p.nama}</option>`;
        });

        if (currentUser.role === 'guru' && currentUser.name) {
            selPenguji.value = currentUser.name;
        }
    }
}

// --- AUTH & MULTI-USER ACCESS CONTROL ---
function checkUserSession() {
    const storedUser = sessionStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        document.getElementById('loginModal').classList.add('hidden');
        applyRoleRestrictions();
    } else {
        document.getElementById('loginModal').classList.remove('hidden');
    }
}

function switchLoginRole(role) {
    const btnGuru = document.getElementById('btnRoleGuru');
    const btnAdmin = document.getElementById('btnRoleAdmin');
    const formGuru = document.getElementById('formLoginGuru');
    const formAdmin = document.getElementById('formLoginAdmin');

    if (role === 'guru') {
        btnGuru.className = 'py-2 rounded-lg bg-amber-500 text-slate-950 shadow-sm transition';
        btnAdmin.className = 'py-2 rounded-lg text-slate-600 hover:text-slate-900 transition';
        formGuru.classList.remove('hidden');
        formAdmin.classList.add('hidden');
    } else {
        btnAdmin.className = 'py-2 rounded-lg bg-blue-900 text-white shadow-sm transition';
        btnGuru.className = 'py-2 rounded-lg text-slate-600 hover:text-slate-900 transition';
        formAdmin.classList.remove('hidden');
        formGuru.classList.add('hidden');
    }
}

function handleLoginGuru(e) {
    e.preventDefault();
    const namaGuru = document.getElementById('loginSelectPenguji').value;
    const passInput = document.getElementById('loginPasswordGuru').value;

    const guruObj = masterPenguji.find(p => p.nama === namaGuru);

    if (!namaGuru) {
        showToast('Pilih nama guru penguji terlebih dahulu!', 'warning');
        return;
    }

    if (!guruObj || passInput !== (guruObj.password || '123456')) {
        showToast('Kata sandi guru salah!', 'warning');
        return;
    }

    currentUser = {
        role: 'guru',
        name: namaGuru,
        kelompok: guruObj.kelompok || 'Takhasus Ula (Tingkat Dasar)'
    };

    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('loginPasswordGuru').value = '';
    applyRoleRestrictions();
    showToast(`Selamat datang Ust. ${namaGuru}`, 'success');
}

function handleLoginAdmin(e) {
    e.preventDefault();
    const pass = document.getElementById('loginAdminPassword').value;

    if (pass === 'admin123') {
        currentUser = {
            role: 'admin',
            name: 'Administrator',
            kelompok: 'ALL'
        };

        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('loginAdminPassword').value = '';
        applyRoleRestrictions();
        showToast('Login Administrator Berhasil!', 'success');
    } else {
        showToast('Kata sandi admin salah!', 'warning');
    }
}

function logoutUser() {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    currentUser = { role: '', name: '', kelompok: '' };
    document.getElementById('loginModal').classList.remove('hidden');
    showToast('Sesi telah diakhiri.', 'info');
}

function applyRoleRestrictions() {
    const userBadgeInfo = document.getElementById('userBadgeInfo');
    const btnKelolaMaster = document.getElementById('btnKelolaMaster');
    const presensiSelectKelompok = document.getElementById('presensiSelectKelompok');

    if (currentUser.role === 'admin') {
        if (userBadgeInfo) {
            userBadgeInfo.innerHTML = `<span class="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase">ADMIN</span> Akses Penuh Sistem`;
        }
        if (btnKelolaMaster) btnKelolaMaster.classList.remove('hidden');
        if (presensiSelectKelompok) presensiSelectKelompok.disabled = false;
    } else {
        if (userBadgeInfo) {
            userBadgeInfo.innerHTML = `<span class="bg-blue-900 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">GURU</span> ${currentUser.name} <span class="text-amber-300 font-normal">(${currentUser.kelompok})</span>`;
        }
        if (btnKelolaMaster) btnKelolaMaster.classList.add('hidden');
        if (presensiSelectKelompok) {
            presensiSelectKelompok.value = currentUser.kelompok;
            presensiSelectKelompok.disabled = true;
        }
    }

    populateMasterDropdowns();
    renderTable();
    populateRaporSelect();
    renderPresensiForm();
    renderPresensiRekap();
}

// --- SIDEBAR TOGGLE ---
function initSidebar() {
    if (window.innerWidth >= 1024) {
        setSidebarState(true);
    } else {
        setSidebarState(false);
    }
}

function setSidebarState(open) {
    isSidebarOpen = open;
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const iconHamburger = document.getElementById('iconHamburger');
    const iconClose = document.getElementById('iconClose');
    const mainWrapper = document.getElementById('mainWrapper');

    if (!sidebar || !iconHamburger || !iconClose || !mainWrapper) return;

    if (open) {
        sidebar.classList.remove('-translate-x-full');
        if (window.innerWidth >= 1024) {
            mainWrapper.classList.add('lg:pl-72');
            if (backdrop) backdrop.classList.add('hidden');
        } else {
            mainWrapper.classList.remove('lg:pl-72');
            if (backdrop) backdrop.classList.remove('hidden');
        }
        iconHamburger.classList.add('hidden');
        iconClose.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        mainWrapper.classList.remove('lg:pl-72');
        if (backdrop) backdrop.classList.add('hidden');
        iconHamburger.classList.remove('hidden');
        iconClose.classList.add('hidden');
    }
}

function toggleSidebar() {
    setSidebarState(!isSidebarOpen);
}

// --- CLOCK & WIDGET ---
function startClockAndWidget() {
    updateClockAndDate();
    setInterval(updateClockAndDate, 1000);
    setInterval(() => {
        showHijriDate = !showHijriDate;
        updateClockAndDate();
    }, 4000);
}

function getMasehiString(now) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} M`;
}

function getHijriString(now) {
    try {
        const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        return formatter.format(now).replace(' AH', ' H').replace(' M', ' H');
    } catch (e) {
        return '1448 H';
    }
}

function updateClockAndDate() {
    const now = new Date();

    const clockEl = document.getElementById('widgetClock');
    if (clockEl) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockEl.innerText = `${hours}:${minutes}:${seconds} WIB`;
    }

    const dateEl = document.getElementById('widgetDate');
    if (dateEl) {
        if (!showHijriDate) {
            dateEl.innerText = getMasehiString(now);
        } else {
            dateEl.innerText = getHijriString(now);
        }
    }
}

// --- PREDIKAT HELPER ---
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

function formatMateriText(det) {
    if (!det) return '-';
    if (typeof det === 'string') return det;

    let parts = [];
    if (det.juz) parts.push(`Juz ${det.juz}`);
    if (det.surat) parts.push(`Surat ${det.surat}`);

    let rangeStr = '';
    if (det.ayatAwal && det.ayatAkhir) rangeStr = `Ayat ${det.ayatAwal}-${det.ayatAkhir}`;
    else if (det.ayatAwal) rangeStr = `Ayat ${det.ayatAwal}`;
    else if (det.ayatAkhir) rangeStr = `s.d. Ayat ${det.ayatAkhir}`;

    if (rangeStr) parts.push(rangeStr);
    if (det.baris) parts.push(`(${det.baris} Baris)`);

    return parts.length > 0 ? parts.join(' ') : '-';
}

function onFormPengujiSelected(namaPenguji) {
    const guruObj = masterPenguji.find(p => p.nama === namaPenguji);
    if (guruObj) {
        // Mendukung penyesuaian jika penguji diubah oleh admin
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
    if (currentUser.role !== 'admin') {
        showToast('Hanya Administrator yang dapat mengelola master data!', 'warning');
        return;
    }
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
    renderPresensiForm();
    showToast('Santri berhasil ditambahkan.', 'success');
}

function deleteMasterSantri(id) {
    masterSantri = masterSantri.filter(s => s.id !== id);
    localStorage.setItem(MASTER_SANTRI_KEY, JSON.stringify(masterSantri));
    populateMasterDropdowns();
    renderMasterTables();
    renderPresensiForm();
}

function addMasterPenguji(e) {
    e.preventDefault();
    const nama = document.getElementById('newNamaPenguji').value.trim();
    const kelompok = document.getElementById('newKelompokPenguji').value;
    const password = document.getElementById('newPasswordPenguji').value.trim() || '123456';

    masterPenguji.unshift({ id: 'p_' + Date.now(), nama, kelompok, password });
    localStorage.setItem(MASTER_PENGUJI_KEY, JSON.stringify(masterPenguji));
    document.getElementById('newNamaPenguji').value = '';
    document.getElementById('newPasswordPenguji').value = '';

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
                <td class="p-2 text-slate-500">${escapeHtml(p.kelompok || '-')}</td>
                <td class="p-2 text-center">
                    <button onclick="deleteMasterPenguji('${p.id}')" class="text-rose-600 hover:text-rose-800"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                </td>
            </tr>
        `).join('');
    }

    if (window.lucide) lucide.createIcons();
}

// --- STORAGE ---
function loadDataFromStorage() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        try { evaluations = JSON.parse(stored); } catch(e) { evaluations = []; }
    }
    renderTable();
    populateRaporSelect();
}

function saveDataToStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(evaluations));
    renderTable();
    populateRaporSelect();
}

function loadPresensiFromStorage() {
    const stored = localStorage.getItem(PRESENSI_STORAGE_KEY);
    if (stored) {
        try { presensiRecords = JSON.parse(stored); } catch(e) { presensiRecords = []; }
    }
    renderPresensiRekap();
}

function savePresensiToStorage() {
    localStorage.setItem(PRESENSI_STORAGE_KEY, JSON.stringify(presensiRecords));
    renderPresensiRekap();
}

// --- TAB NAVIGATION ---
function switchTab(tabKey) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-slate-950', 'shadow-md', 'font-bold');
        btn.classList.add('text-amber-100', 'hover:bg-white/10', 'font-medium');
    });

    const activeTab = document.getElementById('tab-' + tabKey);
    const activeView = document.getElementById('view-' + tabKey);

    if (activeView && activeTab) {
        activeView.classList.remove('hidden');
        activeTab.classList.add('bg-amber-500', 'text-slate-950', 'shadow-md', 'font-bold');
        activeTab.classList.remove('text-amber-100', 'hover:bg-white/10', 'font-medium');
    }

    if (tabKey === 'rekap') renderTable();
    if (tabKey === 'presensi') {
        renderPresensiForm();
        renderPresensiRekap();
    }
    if (tabKey === 'print') {
        populateRaporSelect();
        const sel = document.getElementById('raporSelectSantri');
        if (sel && sel.value) loadRaporView(sel.value);
    }

    if (window.innerWidth < 1024) {
        setSidebarState(false);
    }

    if (window.lucide) lucide.createIcons();
}

// --- PRESENSI SUB-TAB NAVIGATION ---
function switchPresensiSubTab(subTab) {
    const btnInput = document.getElementById('btnPresensiSubInput');
    const btnRekap = document.getElementById('btnPresensiSubRekap');
    const viewInput = document.getElementById('presensiSubInput');
    const viewRekap = document.getElementById('presensiSubRekap');

    if (!btnInput || !btnRekap || !viewInput || !viewRekap) return;

    if (subTab === 'input') {
        viewInput.classList.remove('hidden');
        viewRekap.classList.add('hidden');
        btnInput.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 bg-amber-500 text-slate-950 shadow';
        btnRekap.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100';
        renderPresensiForm();
    } else {
        viewInput.classList.add('hidden');
        viewRekap.classList.remove('hidden');
        btnRekap.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 bg-amber-500 text-slate-950 shadow';
        btnInput.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100';
        renderPresensiRekap();
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

function calculateMurajaahScore() {
    const kelancaran = parseFloat(document.getElementById('murajaah_kelancaran')?.value) || 0;
    const tajwid = parseFloat(document.getElementById('murajaah_tajwid')?.value) || 0;
    const urutan = parseFloat(document.getElementById('murajaah_urutan')?.value) || 0;

    const c_kelancaran = kelancaran * 0.50;
    const c_tajwid = tajwid * 0.30;
    const c_urutan = urutan * 0.20;

    if (document.getElementById('contrib_murajaah_kelancaran')) document.getElementById('contrib_murajaah_kelancaran').innerText = c_kelancaran.toFixed(1);
    if (document.getElementById('contrib_murajaah_tajwid')) document.getElementById('contrib_murajaah_tajwid').innerText = c_tajwid.toFixed(1);
    if (document.getElementById('contrib_murajaah_urutan')) document.getElementById('contrib_murajaah_urutan').innerText = c_urutan.toFixed(1);

    const total = c_kelancaran + c_tajwid + c_urutan;
    if (document.getElementById('totalMurajaahDisplay')) document.getElementById('totalMurajaahDisplay').innerText = total.toFixed(1);

    const murajaahBadgeContainer = document.getElementById('murajaahStatusBadgeContainer');
    if (murajaahBadgeContainer) {
        const pred = getPredikatQuran(total);
        murajaahBadgeContainer.innerHTML = `
            <span class="inline-flex items-center gap-1 ${pred.badge} border px-2.5 py-0.5 rounded-full text-xs">
                ${pred.title}
            </span>
        `;
    }
}

function updateStatusIndicator(score) {
    const badgeContainer = document.getElementById('statusBadgeContainer');
    const descContainer = document.getElementById('statusRecommendationText');

    if (!badgeContainer || !descContainer) return;

    const pred = getPredikatQuran(score);

    badgeContainer.innerHTML = `
        <span class="inline-flex items-center gap-1 ${pred.badge} border px-2.5 py-0.5 rounded-full text-xs">
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

// --- FORM EVALUASI SUBMIT ---
function handleFormSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-id').value;
    const totalHafalan = parseFloat(document.getElementById('totalHafalanDisplay').innerText);
    const totalMurajaah = parseFloat(document.getElementById('totalMurajaahDisplay').innerText);

    const ziyadahDetail = {
        juz: document.getElementById('ziyadah_juz').value.trim(),
        surat: document.getElementById('ziyadah_surat').value,
        ayatAwal: document.getElementById('ziyadah_ayat_awal').value.trim(),
        ayatAkhir: document.getElementById('ziyadah_ayat_akhir').value.trim(),
        baris: document.getElementById('ziyadah_baris').value.trim()
    };

    const murajaahDetail = {
        juz: document.getElementById('murajaah_juz').value.trim(),
        surat: document.getElementById('murajaah_surat').value,
        ayatAwal: document.getElementById('murajaah_ayat_awal').value.trim(),
        ayatAkhir: document.getElementById('murajaah_ayat_akhir').value.trim(),
        baris: document.getElementById('murajaah_baris').value.trim()
    };

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
        showToast('Pilih Santri Binaan terlebih dahulu!', 'warning');
        return;
    }

    const evalObj = {
        id: editId ? editId : 'eval_' + Date.now(),
        namaSantri: namaSantri,
        nisSantri: nisSantri,
        kelompokSantri: kelompokSantri,
        ziyadahDetail: ziyadahDetail,
        juzUjian: formatMateriText(ziyadahDetail),
        murajaahDetail: murajaahDetail,
        materiMurajaah: formatMateriText(murajaahDetail),
        tglEvaluasi: document.getElementById('tglEvaluasi').value,
        namaPenguji: namaPenguji,
        hafalan: {
            kelancaran: parseFloat(document.getElementById('hafalan_kelancaran').value) || 0,
            tajwid: parseFloat(document.getElementById('hafalan_tajwid').value) || 0,
            urutan: parseFloat(document.getElementById('hafalan_urutan').value) || 0,
            kemandirian: parseFloat(document.getElementById('hafalan_kemandirian').value) || 0
        },
        totalHafalan: totalHafalan,
        murajaah: {
            kelancaran: parseFloat(document.getElementById('murajaah_kelancaran').value) || 0,
            tajwid: parseFloat(document.getElementById('murajaah_tajwid').value) || 0,
            urutan: parseFloat(document.getElementById('murajaah_urutan').value) || 0
        },
        totalMurajaah: totalMurajaah,
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
    document.getElementById('namaSantri').value = '';
    document.getElementById('nisSantri').value = '';
    document.getElementById('kelompokSantri').value = '';
    document.getElementById('tglEvaluasi').value = new Date().toISOString().split('T')[0];

    if (currentUser.role === 'guru' && currentUser.name) {
        document.getElementById('selectPenguji').value = currentUser.name;
    }

    calculateHafalanScore();
    calculateMurajaahScore();
    calculateAdabScore();
}

// --- PRESENSI / DAFTAR HADIR LOGIC ---
function renderPresensiForm() {
    const tbody = document.getElementById('presensiInputTableBody');
    const selectKelompok = document.getElementById('presensiSelectKelompok');
    const inputTgl = document.getElementById('presensiTanggal');

    if (!tbody || !selectKelompok || !inputTgl) return;

    const kelompok = selectKelompok.value;
    const tanggal = inputTgl.value;

    const santriInKelompok = masterSantri.filter(s => s.kelompok && s.kelompok.trim() === kelompok.trim());

    if (santriInKelompok.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-slate-400">Tidak ada santri binaan pada kelompok ini.</td></tr>`;
        return;
    }

    tbody.innerHTML = santriInKelompok.map(santri => {
        const existing = presensiRecords.find(p => p.santriId === santri.id && p.tanggal === tanggal);
        const currentStatus = existing ? existing.status : 'Hadir';
        const currentNote = existing ? existing.catatan : '';

        return `
            <tr class="hover:bg-slate-50">
                <td class="p-3">
                    <strong class="text-slate-800 block">${escapeHtml(santri.nama)}</strong>
                </td>
                <td class="p-3 text-center">
                    <div class="inline-flex items-center gap-2 text-xs font-semibold">
                        <label class="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="status_${santri.id}" value="Hadir" ${currentStatus === 'Hadir' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500">
                            <span class="text-emerald-700">H</span>
                        </label>
                        <label class="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="status_${santri.id}" value="Izin" ${currentStatus === 'Izin' ? 'checked' : ''} class="text-blue-600 focus:ring-blue-500">
                            <span class="text-blue-700">I</span>
                        </label>
                        <label class="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="status_${santri.id}" value="Sakit" ${currentStatus === 'Sakit' ? 'checked' : ''} class="text-amber-600 focus:ring-amber-500">
                            <span class="text-amber-700">S</span>
                        </label>
                        <label class="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="status_${santri.id}" value="Alpa" ${currentStatus === 'Alpa' ? 'checked' : ''} class="text-rose-600 focus:ring-rose-500">
                            <span class="text-rose-700">A</span>
                        </label>
                    </div>
                </td>
                <td class="p-3">
                    <input type="text" id="note_${santri.id}" value="${escapeHtml(currentNote)}" placeholder="Catatan (Opsional)" class="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500">
                </td>
            </tr>
        `;
    }).join('');
}

function handlePresensiSubmit(e) {
    e.preventDefault();

    const selectKelompok = document.getElementById('presensiSelectKelompok');
    const inputTgl = document.getElementById('presensiTanggal');
    const kelompok = selectKelompok.value;
    const tanggal = inputTgl.value;

    const santriInKelompok = masterSantri.filter(s => s.kelompok && s.kelompok.trim() === kelompok.trim());

    santriInKelompok.forEach(santri => {
        const selectedRadio = document.querySelector(`input[name="status_${santri.id}"]:checked`);
        const noteInput = document.getElementById(`note_${santri.id}`);

        const status = selectedRadio ? selectedRadio.value : 'Hadir';
        const catatan = noteInput ? noteInput.value.trim() : '';

        const recordIndex = presensiRecords.findIndex(p => p.santriId === santri.id && p.tanggal === tanggal);

        const newRecord = {
            id: recordIndex !== -1 ? presensiRecords[recordIndex].id : 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            santriId: santri.id,
            namaSantri: santri.nama,
            nisSantri: santri.nis,
            kelompok: santri.kelompok,
            tanggal: tanggal,
            status: status,
            catatan: catatan,
            pencatat: currentUser.name || 'Admin'
        };

        if (recordIndex !== -1) {
            presensiRecords[recordIndex] = newRecord;
        } else {
            presensiRecords.unshift(newRecord);
        }
    });

    savePresensiToStorage();
    showToast('Data presensi berhasil disimpan!', 'success');
}

// --- REKAPITULASI PRESENSI DENGAN FILTER PERIODE & SORTIR ---
function renderPresensiRekap() {
    const tbody = document.getElementById('presensiRekapTableBody');
    const filterPeriode = document.getElementById('presensiFilterPeriode')?.value || 'ALL';
    const sortBy = document.getElementById('presensiSortBy')?.value || 'NAMA_ASC';
    const infoPeriodeText = document.getElementById('presensiInfoPeriodeText');
    const infoTotalSesiText = document.getElementById('presensiInfoTotalSesiText');

    if (!tbody) return;

    tbody.innerHTML = '';

    const now = new Date();
    let cutoffDate = null;
    let periodeLabel = 'Semua Waktu';

    if (filterPeriode === 'PEKAN') {
        cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - 7);
        periodeLabel = '7 Hari Terakhir (Perpekan)';
    } else if (filterPeriode === 'BULAN') {
        cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - 30);
        periodeLabel = '30 Hari Terakhir (Perbulan)';
    } else if (filterPeriode === 'TENGAH_SEMESTER') {
        cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - 90);
        periodeLabel = '3 Bulan Terakhir (Per Tengah Semester)';
    } else if (filterPeriode === 'SEMESTER') {
        cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - 180);
        periodeLabel = '6 Bulan Terakhir (Per Semester)';
    }

    if (infoPeriodeText) {
        infoPeriodeText.innerHTML = `<i data-lucide="filter" class="w-4 h-4 text-amber-600 inline mr-1"></i> Periode Rekap: ${periodeLabel}`;
    }

    let baseSantri = masterSantri;
    if (currentUser.role === 'guru' && currentUser.kelompok) {
        baseSantri = masterSantri.filter(s => s.kelompok && s.kelompok.trim() === currentUser.kelompok.trim());
    }

    if (baseSantri.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-400">Belum ada data santri untuk rekapitulasi.</td></tr>`;
        if (infoTotalSesiText) infoTotalSesiText.innerText = `Total Sesi Terlaksana: 0 Pertemuan`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    let filteredRecords = presensiRecords;
    if (cutoffDate) {
        const cutoffStr = cutoffDate.toISOString().split('T')[0];
        filteredRecords = presensiRecords.filter(p => p.tanggal >= cutoffStr);
    }

    const uniqueDates = [...new Set(filteredRecords.map(p => p.tanggal))];
    if (infoTotalSesiText) {
        infoTotalSesiText.innerText = `Total Sesi Terlaksana: ${uniqueDates.length} Pertemuan`;
    }

    let santriStats = baseSantri.map(santri => {
        const records = filteredRecords.filter(p => p.santriId === santri.id);
        const total = records.length;

        const hadir = records.filter(p => p.status === 'Hadir').length;
        const izin = records.filter(p => p.status === 'Izin').length;
        const sakit = records.filter(p => p.status === 'Sakit').length;
        const alpa = records.filter(p => p.status === 'Alpa').length;

        const persenVal = total > 0 ? (hadir / total) * 100 : 0;
        const persenStr = persenVal.toFixed(1);

        return {
            santri,
            hadir,
            izin,
            sakit,
            alpa,
            total,
            persenVal,
            persenStr
        };
    });

    if (sortBy === 'NAMA_ASC') {
        santriStats.sort((a, b) => a.santri.nama.localeCompare(b.santri.nama));
    } else if (sortBy === 'PERSEN_DESC') {
        santriStats.sort((a, b) => b.persenVal - a.persenVal);
    } else if (sortBy === 'PERSEN_ASC') {
        santriStats.sort((a, b) => a.persenVal - b.persenVal);
    } else if (sortBy === 'ALPA_DESC') {
        santriStats.sort((a, b) => b.alpa - a.alpa);
    }

    santriStats.forEach(stat => {
        let badgeClass = 'bg-emerald-100 text-emerald-800';
        if (stat.persenVal < 80) badgeClass = 'bg-amber-100 text-amber-800';
        if (stat.persenVal < 60) badgeClass = 'bg-rose-100 text-rose-800';

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50/80 transition';
        tr.innerHTML = `
            <td class="p-3">
                <div class="font-bold text-slate-800">${escapeHtml(stat.santri.nama)}</div>
            </td>
            <td class="p-3 text-center font-bold text-emerald-600">${stat.hadir}</td>
            <td class="p-3 text-center font-bold text-blue-600">${stat.izin}</td>
            <td class="p-3 text-center font-bold text-amber-600">${stat.sakit}</td>
            <td class="p-3 text-center font-bold text-rose-600">${stat.alpa}</td>
            <td class="p-3 text-center font-semibold text-slate-600">${stat.total}</td>
            <td class="p-3 text-center">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeClass}">${stat.persenStr}%</span>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
}

// --- UNDUH EXCEL & PDF PRESENSI ---
function exportPresensiExcel() {
    let baseSantri = masterSantri;
    if (currentUser.role === 'guru' && currentUser.kelompok) {
        baseSantri = masterSantri.filter(s => s.kelompok && s.kelompok.trim() === currentUser.kelompok.trim());
    }

    if (baseSantri.length === 0) {
        showToast('Tidak ada data presensi untuk diekspor.', 'warning');
        return;
    }

    const filterPeriode = document.getElementById('presensiFilterPeriode')?.value || 'ALL';
    let csv = 'Nama Santri,Hadir,Izin,Sakit,Alpa,Total Sesi,% Kehadiran\n';

    const now = new Date();
    let cutoffDate = null;
    if (filterPeriode === 'PEKAN') { cutoffDate = new Date(); cutoffDate.setDate(now.getDate() - 7); }
    else if (filterPeriode === 'BULAN') { cutoffDate = new Date(); cutoffDate.setDate(now.getDate() - 30); }
    else if (filterPeriode === 'TENGAH_SEMESTER') { cutoffDate = new Date(); cutoffDate.setDate(now.getDate() - 90); }
    else if (filterPeriode === 'SEMESTER') { cutoffDate = new Date(); cutoffDate.setDate(now.getDate() - 180); }

    let filteredRecords = presensiRecords;
    if (cutoffDate) {
        const cutoffStr = cutoffDate.toISOString().split('T')[0];
        filteredRecords = presensiRecords.filter(p => p.tanggal >= cutoffStr);
    }

    baseSantri.forEach(s => {
        const records = filteredRecords.filter(p => p.santriId === s.id);
        const total = records.length;
        const hadir = records.filter(p => p.status === 'Hadir').length;
        const izin = records.filter(p => p.status === 'Izin').length;
        const sakit = records.filter(p => p.status === 'Sakit').length;
        const alpa = records.filter(p => p.status === 'Alpa').length;
        const persen = total > 0 ? ((hadir / total) * 100).toFixed(1) : '0.0';

        csv += `"${s.nama}",${hadir},${izin},${sakit},${alpa},${total},"${persen}%"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Presensi_Takhasus_${filterPeriode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File Excel Rekap Presensi berhasil diunduh.', 'success');
}

function exportPresensiPDF() {
    window.print();
}

// --- REKAP TABLE & ROLE FILTER ---
function renderTable() {
    const tbody = document.getElementById('rekapTableBody');
    if (!tbody) return;

    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filter = document.getElementById('filterStatus')?.value || 'ALL';

    tbody.innerHTML = '';

    let baseData = evaluations;
    if (currentUser.role === 'guru' && currentUser.kelompok) {
        baseData = evaluations.filter(item => item.kelompokSantri && item.kelompokSantri.trim() === currentUser.kelompok.trim());
    }

    let filtered = baseData.filter(item => {
        const matchSearch = item.namaSantri.toLowerCase().includes(search);
        let matchStatus = true;
        const pred = getPredikatQuran(item.totalHafalan);
        if (filter !== 'ALL') matchStatus = pred.code === filter;

        return matchSearch && matchStatus;
    });

    if (document.getElementById('statTotalSantri')) document.getElementById('statTotalSantri').innerText = baseData.length;
    const countLulus = baseData.filter(i => i.totalHafalan >= 80).length;
    const countRemedial = baseData.filter(i => i.totalHafalan < 80 && i.totalHafalan >= 60).length;
    const avgHafalan = baseData.length > 0 ? (baseData.reduce((acc, curr) => acc + curr.totalHafalan, 0) / baseData.length).toFixed(1) : '0.0';

    if (document.getElementById('statLulus')) document.getElementById('statLulus').innerText = countLulus;
    if (document.getElementById('statRemedial')) document.getElementById('statRemedial').innerText = countRemedial;
    if (document.getElementById('statAvgHafalan')) document.getElementById('statAvgHafalan').innerText = avgHafalan;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-8 text-slate-400">
                    <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                    <p class="font-medium text-xs">Belum ada data penilaian santri binaan yang sesuai.</p>
                </td>
            </tr>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    filtered.forEach(item => {
        const pred = getPredikatQuran(item.totalHafalan);
        const ziyadahStr = formatMateriText(item.ziyadahDetail || item.juzUjian);
        const murajaahStr = formatMateriText(item.murajaahDetail || item.materiMurajaah);

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50/80 transition';
        tr.innerHTML = `
            <td class="p-3.5">
                <div class="font-bold text-slate-800">${escapeHtml(item.namaSantri)}</div>
            </td>
            <td class="p-3.5 font-medium text-slate-700">
                <div><span class="text-amber-700 font-bold">Ziyadah:</span> ${escapeHtml(ziyadahStr)}</div>
                <div class="text-[11px] text-slate-500 mt-0.5"><span class="text-blue-900 font-bold">Muraja'ah:</span> ${escapeHtml(murajaahStr)}</div>
            </td>
            <td class="p-3.5 text-center font-bold text-amber-700 text-base">${item.totalHafalan.toFixed(1)}</td>
            <td class="p-3.5 text-center font-bold text-blue-900 text-base">${(item.totalMurajaah || 0).toFixed(1)}</td>
            <td class="p-3.5 text-center">
                <span class="px-2.5 py-1 rounded-full text-[11px] border ${pred.badge}">${pred.title}</span>
            </td>
            <td class="p-3.5 text-center font-bold text-slate-700">${item.totalAdab}</td>
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
    document.getElementById('tglEvaluasi').value = item.tglEvaluasi;

    if (item.ziyadahDetail) {
        document.getElementById('ziyadah_juz').value = item.ziyadahDetail.juz || '';
        document.getElementById('ziyadah_surat').value = item.ziyadahDetail.surat || '';
        document.getElementById('ziyadah_ayat_awal').value = item.ziyadahDetail.ayatAwal || '';
        document.getElementById('ziyadah_ayat_akhir').value = item.ziyadahDetail.ayatAkhir || '';
        document.getElementById('ziyadah_baris').value = item.ziyadahDetail.baris || '';
    }

    if (item.murajaahDetail) {
        document.getElementById('murajaah_juz').value = item.murajaahDetail.juz || '';
        document.getElementById('murajaah_surat').value = item.murajaahDetail.surat || '';
        document.getElementById('murajaah_ayat_awal').value = item.murajaahDetail.ayatAwal || '';
        document.getElementById('murajaah_ayat_akhir').value = item.murajaahDetail.ayatAkhir || '';
        document.getElementById('murajaah_baris').value = item.murajaahDetail.baris || '';
    }

    document.getElementById('hafalan_kelancaran').value = item.hafalan.kelancaran;
    document.getElementById('hafalan_tajwid').value = item.hafalan.tajwid;
    document.getElementById('hafalan_urutan').value = item.hafalan.urutan;
    document.getElementById('hafalan_kemandirian').value = item.hafalan.kemandirian;

    if (item.murajaah) {
        document.getElementById('murajaah_kelancaran').value = item.murajaah.kelancaran || 85;
        document.getElementById('murajaah_tajwid').value = item.murajaah.tajwid || 80;
        document.getElementById('murajaah_urutan').value = item.murajaah.urutan || 85;
    }

    const fieldsAdab = ['allah', 'guru', 'quran', 'teman', 'tanggungjawab', 'lingkungan', 'kejujuran', 'kemandirian', 'emosi'];
    fieldsAdab.forEach(f => {
        if (item.adab && item.adab[f] !== undefined) {
            document.getElementById('adab_' + f).value = item.adab[f];
        }
    });

    document.getElementById('catatanPenguji').value = item.catatan || '';

    calculateHafalanScore();
    calculateMurajaahScore();
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

// --- CETAK RAPOR GENERATOR ---
function populateRaporSelect() {
    const sel = document.getElementById('raporSelectSantri');
    if (!sel) return;

    sel.innerHTML = '';

    let baseData = evaluations;
    if (currentUser.role === 'guru' && currentUser.kelompok) {
        baseData = evaluations.filter(item => item.kelompokSantri && item.kelompokSantri.trim() === currentUser.kelompok.trim());
    }

    if (baseData.length === 0) {
        sel.innerHTML = '<option value="">(Belum Ada Data Santri)</option>';
        if (document.getElementById('raporContainer')) {
            document.getElementById('raporContainer').innerHTML = '<p class="text-center py-10 text-slate-400">Belum ada data evaluasi santri.</p>';
        }
        return;
    }

    baseData.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        const zStr = formatMateriText(item.ziyadahDetail || item.juzUjian);
        opt.innerText = `${item.namaSantri} - ${zStr} (${item.tglEvaluasi})`;
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
    const ziyadahStr = formatMateriText(item.ziyadahDetail || item.juzUjian);
    const murajaahStr = formatMateriText(item.murajaahDetail || item.materiMurajaah);

    // Dapatkan data presensi santri terkait
    const santriObj = masterSantri.find(s => s.nama === item.namaSantri);
    let pHadir = 0, pIzin = 0, pSakit = 0, pAlpa = 0, pTotal = 0, pPersen = '100.0';

    if (santriObj) {
        const pRecords = presensiRecords.filter(p => p.santriId === santriObj.id);
        pTotal = pRecords.length;
        pHadir = pRecords.filter(p => p.status === 'Hadir').length;
        pIzin = pRecords.filter(p => p.status === 'Izin').length;
        pSakit = pRecords.filter(p => p.status === 'Sakit').length;
        pAlpa = pRecords.filter(p => p.status === 'Alpa').length;
        if (pTotal > 0) pPersen = ((pHadir / pTotal) * 100).toFixed(1);
    }

    container.innerHTML = `
        <div class="border-b-2 border-blue-950 pb-4 mb-6 text-center">
            <div class="text-amber-600 font-serif text-lg mb-1">۞ بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۞</div>
            <img src="https://lh3.googleusercontent.com/d/1Zw8z1i2yixH-k6umwcDbOc7Xu6v3HTQl" alt="Logo Al Firdaus" class="w-20 h-20 mx-auto mb-2 object-contain">
            <h2 class="text-xl sm:text-2xl font-extrabold text-blue-950 tracking-wide uppercase">RAPOR EVALUASI TAKHASUS AL-QUR'AN</h2>
            <p class="text-xs sm:text-sm text-amber-700 font-bold">AL FIRDAUS BANDAR LAMPUNG</p>
            <p class="text-xs text-slate-500">Lembaga Pendidikan Al-Qur'an & Bimbingan Hafalan</p>
        </div>

        <div class="grid grid-cols-2 gap-4 text-xs sm:text-sm mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
                <p class="text-slate-500">Nama Santri: <strong class="text-slate-800">${escapeHtml(item.namaSantri)}</strong></p>
                <p class="text-slate-500 mt-1">NIS / ID: <strong class="text-slate-800">${escapeHtml(item.nisSantri)}</strong></p>
                <p class="text-slate-500 mt-1">Kelompok: <strong class="text-slate-800">${escapeHtml(item.kelompokSantri)}</strong></p>
            </div>
            <div>
                <p class="text-slate-500">Tanggal Evaluasi: <strong class="text-slate-800">${item.tglEvaluasi}</strong></p>
                <p class="text-slate-500 mt-1">Penguji: <strong class="text-slate-800">${escapeHtml(item.namaPenguji)}</strong></p>
            </div>
        </div>

        <div class="mb-6">
            <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-amber-500 pl-2">A. Penilaian Hafalan Baru (Ziyadah): ${escapeHtml(ziyadahStr)}</h3>
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
                        <td class="border border-slate-300 p-2 text-center font-bold text-amber-800">${(item.hafalan.kelancaran * 0.4).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-300 p-2">Tajwid & Makhorijul Huruf</td>
                        <td class="border border-slate-300 p-2 text-center">25%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.hafalan.tajwid}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-amber-800">${(item.hafalan.tajwid * 0.25).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-300 p-2">Ketepatan Ayat & Urutan Ayat</td>
                        <td class="border border-slate-300 p-2 text-center">20%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.hafalan.urutan}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-amber-800">${(item.hafalan.urutan * 0.20).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-300 p-2">Kemandirian & Kesiapan Hafalan</td>
                        <td class="border border-slate-300 p-2 text-center">15%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.hafalan.kemandirian}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-amber-800">${(item.hafalan.kemandirian * 0.15).toFixed(1)}</td>
                    </tr>
                    <tr class="bg-amber-50 font-bold">
                        <td colspan="3" class="border border-slate-300 p-2 text-right text-slate-800">TOTAL SKOR ZIYADAH</td>
                        <td class="border border-slate-300 p-2 text-center text-base text-amber-900 font-extrabold">${item.totalHafalan.toFixed(1)} / 100</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="mb-6">
            <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-blue-900 pl-2">B. Penilaian Muraja'ah: ${escapeHtml(murajaahStr)}</h3>
            <table class="w-full text-xs sm:text-sm border-collapse border border-slate-300">
                <thead>
                    <tr class="bg-slate-100 text-slate-700 font-bold">
                        <th class="border border-slate-300 p-2 text-left">Komponen Muraja'ah</th>
                        <th class="border border-slate-300 p-2 text-center">Bobot</th>
                        <th class="border border-slate-300 p-2 text-center">Nilai Mentah</th>
                        <th class="border border-slate-300 p-2 text-center">Nilai Akhir</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="border border-slate-300 p-2">Kelancaran Muraja'ah</td>
                        <td class="border border-slate-300 p-2 text-center">50%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.murajaah?.kelancaran || 0}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-blue-900">${((item.murajaah?.kelancaran || 0) * 0.5).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-300 p-2">Tajwid & Makhraj Muraja'ah</td>
                        <td class="border border-slate-300 p-2 text-center">30%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.murajaah?.tajwid || 0}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-blue-900">${((item.murajaah?.tajwid || 0) * 0.3).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-300 p-2">Ketepatan & Sambung Ayat</td>
                        <td class="border border-slate-300 p-2 text-center">20%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.murajaah?.urutan || 0}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-blue-900">${((item.murajaah?.urutan || 0) * 0.2).toFixed(1)}</td>
                    </tr>
                    <tr class="bg-blue-50 font-bold">
                        <td colspan="3" class="border border-slate-300 p-2 text-right text-slate-800">TOTAL SKOR MURAJA'AH</td>
                        <td class="border border-slate-300 p-2 text-center text-base text-blue-950 font-extrabold">${(item.totalMurajaah || 0).toFixed(1)} / 100</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-amber-500 pl-2">C. Skor Adab & Karakter</h3>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div class="flex justify-between"><span>Total Skor Adab:</span> <strong class="text-blue-900 font-bold text-sm">${item.totalAdab} / 100</strong></div>
                    <div class="flex justify-between text-slate-500"><span>Kualifikasi:</span> <span>${getAdabPredikatText(item.totalAdab)}</span></div>
                </div>
            </div>
            <div>
                <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-emerald-600 pl-2">D. Rekap Kehadiran / Presensi</h3>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div class="flex justify-between"><span>Hadir: <strong>${pHadir}</strong> | Izin: <strong>${pIzin}</strong> | Sakit: <strong>${pSakit}</strong> | Alpa: <strong>${pAlpa}</strong></span></div>
                    <div class="flex justify-between text-slate-700 font-bold mt-1"><span>Prosentase Kehadiran:</span> <span class="text-emerald-700">${pPersen}%</span></div>
                </div>
            </div>
        </div>

        <div class="mb-6">
            <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-blue-900 pl-2">E. Predikat Ziyadah & Rekomendasi</h3>
            <div class="p-3 rounded-xl border ${pred.badge} text-xs">
                <strong class="block font-bold text-sm mb-1">${pred.title}</strong>
                <span>${pred.statusText}</span>
            </div>
        </div>

        <div class="mb-8">
            <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-slate-600 pl-2">F. Catatan / Rekomendasi Ustadz Penguji</h3>
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs italic text-slate-700">
                "${escapeHtml(item.catatan || 'Tidak ada catatan tambahan.')}"
            </div>
        </div>

        <!-- TANDA TANGAN LENGKAP: WALI, GURU PENGUJI, DAN KEPALA LPQ -->
        <div class="grid grid-cols-3 text-center text-xs mt-12 pt-6 border-t border-slate-200 gap-2">
            <div>
                <p class="text-slate-500">Orang Tua / Wali Santri</p>
                <div class="h-16"></div>
                <p class="font-bold text-slate-800">( ............................................ )</p>
            </div>
            <div>
                <p class="text-slate-500">Guru / Penguji Binaan</p>
                <div class="h-16"></div>
                <p class="font-bold text-slate-800">${escapeHtml(item.namaPenguji)}</p>
            </div>
            <div>
                <p class="text-slate-500">Mengetahui,<br><strong>Kepala LPQ Al Firdaus</strong></p>
                <div class="h-12"></div>
                <p class="font-bold text-slate-800">( Ust. H. Ahmad Sanusi, M.Pd )</p>
            </div>
        </div>
    `;
}

// --- WHATSAPP GENERATOR ---
function openWaModalFor(id) {
    const item = evaluations.find(i => i.id === id);
    if (!item) return;

    const pred = getPredikatQuran(item.totalHafalan);
    const predMurajaah = getPredikatQuran(item.totalMurajaah || 0);

    const ziyadahStr = formatMateriText(item.ziyadahDetail || item.juzUjian);
    const murajaahStr = formatMateriText(item.murajaahDetail || item.materiMurajaah);

    const text = `*RAPOR EVALUASI TAKHASUS AL-QUR'AN* 📖\n` +
        `*AL FIRDAUS BANDAR LAMPUNG*\n` +
        `----------------------------------------\n` +
        `*Nama Santri:* ${item.namaSantri}\n` +
        `*NIS:* ${item.nisSantri}\n` +
        `*Kelompok:* ${item.kelompokSantri}\n` +
        `*Tanggal Evaluasi:* ${item.tglEvaluasi}\n\n` +
        `📖 *HAFALAN BARU (ZIYADAH):*\n` +
        `   ${ziyadahStr}\n` +
        `📊 *Skor Ziyadah:* ${item.totalHafalan.toFixed(1)} / 100 (${pred.title})\n\n` +
        `🔄 *MURAJA'AH:*\n` +
        `   ${murajaahStr}\n` +
        `📊 *Skor Muraja'ah:* ${(item.totalMurajaah || 0).toFixed(1)} / 100 (${predMurajaah.title})\n\n` +
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
    let baseData = evaluations;
    if (currentUser.role === 'guru' && currentUser.kelompok) {
        baseData = evaluations.filter(item => item.kelompokSantri && item.kelompokSantri.trim() === currentUser.kelompok.trim());
    }

    if (baseData.length === 0) {
        showToast('Tidak ada data untuk diekspor.', 'warning');
        return;
    }

    let csv = 'ID,Nama Santri,NIS,Kelompok,Ziyadah,Murajaah,Tanggal,Skor Ziyadah,Skor Murajaah,Predikat Ziyadah,Skor Adab,Penguji,Catatan\n';

    baseData.forEach(i => {
        const pred = getPredikatQuran(i.totalHafalan);
        const ziyadahStr = formatMateriText(i.ziyadahDetail || i.juzUjian);
        const murajaahStr = formatMateriText(i.murajaahDetail || i.materiMurajaah);

        csv += `"${i.id}","${i.namaSantri}","${i.nisSantri}","${i.kelompokSantri}","${ziyadahStr}","${murajaahStr}","${i.tglEvaluasi}",${i.totalHafalan.toFixed(1)},${(i.totalMurajaah || 0).toFixed(1)},"${pred.title}",${i.totalAdab},"${i.namaPenguji}","${(i.catatan || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Takhasus_AlFirdaus_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh.', 'success');
}

// --- UTILITIES ---
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
