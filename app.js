// Memastikan script berjalan setelah DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {

  // Tanggal default hari ini
  document.getElementById('tanggalUjian').valueAsDate = new Date();

  // Inisialisasi Event Listener Input
  const inputsHafalan = document.querySelectorAll('.input-hafalan');
  const inputsAdab = document.querySelectorAll('.input-adab');

  inputsHafalan.forEach(input => input.addEventListener('input', hitungNilai));
  inputsAdab.forEach(input => input.addEventListener('input', hitungNilai));

  document.getElementById('btnSimpan').addEventListener('click', simpanData);
  document.getElementById('btnWA').addEventListener('click', kirimWhatsApp);
  document.getElementById('btnExportCSV').addEventListener('click', exportCSV);

  // Load data awal dari LocalStorage
  muatTabel();
});

// Logika Perhitungan Nilai
function hitungNilai() {
  // 1. Ambil & Hitung Nilai Hafalan Berdasarkan Bobot
  const kelancaran = parseFloat(document.getElementById('scoreKelancaran').value) || 0;
  const tajwid = parseFloat(document.getElementById('scoreTajwid').value) || 0;
  const urutan = parseFloat(document.getElementById('scoreUrutan').value) || 0;
  const kesiapan = parseFloat(document.getElementById('scoreKesiapan').value) || 0;

  // Rumus Bobot: (Kelancaran * 40%) + (Tajwid * 25%) + (Urutan * 20%) + (Kesiapan * 15%)
  const totalHafalan = (kelancaran * 0.40) + (tajwid * 0.25) + (urutan * 0.20) + (kesiapan * 0.15);

  // Update Tampilan Nilai Hafalan
  document.getElementById('totalNilaiHafalan').innerText = totalHafalan.toFixed(1);

  // 2. Evaluasi Status Kelulusan
  const boxStatus = document.getElementById('boxStatus');
  const teksStatus = document.getElementById('teksStatus');

  if (totalHafalan >= 85) {
    teksStatus.innerText = "Dapat Melanjutkan ke Juz Berikutnya";
    boxStatus.className = "mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800";
  } else if (totalHafalan >= 75) {
    teksStatus.innerText = "Remedial pada bagian yang belum kuat, lalu tes ulang";
    boxStatus.className = "mb-6 p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-800";
  } else if (totalHafalan > 0) {
    teksStatus.innerText = "Penguatan hafalan & bimbingan intensif sebelum tes ulang";
    boxStatus.className = "mb-6 p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800";
  } else {
    teksStatus.innerText = "Silakan masukkan nilai hafalan";
    boxStatus.className = "mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-700";
  }

  // 3. Hitung Nilai Adab & Karakter
  let totalAdab = 0;
  inputsAdab = document.querySelectorAll('.input-adab');
  inputsAdab.forEach(inp => {
    totalAdab += parseFloat(inp.value) || 0;
  });

  document.getElementById('totalNilaiAdab').innerText = `${totalAdab} / 100`;
}

// Fitur Simpan Data ke LocalStorage
function simpanData() {
  const nama = document.getElementById('namaSantri').value;
  const juz = document.getElementById('juzUjian').value;
  const tanggal = document.getElementById('tanggalUjian').value;
  const nilaiHafalan = document.getElementById('totalNilaiHafalan').innerText;
  const nilaiAdab = document.getElementById('totalNilaiAdab').innerText;
  const status = document.getElementById('teksStatus').innerText;

  if (!nama || !juz) {
    alert("Mohon isi Nama Santri dan Juz/Surah terlebih dahulu!");
    return;
  }

  const dataSantri = {
    id: Date.now(),
    nama,
    juz,
    tanggal,
    nilaiHafalan,
    nilaiAdab,
    status
  };

  let listSantri = JSON.parse(localStorage.getItem('takhasus_santri')) || [];
  listSantri.push(dataSantri);
  localStorage.setItem('takhasus_santri', JSON.stringify(listSantri));

  alert("Data berhasil disimpan!");
  muatTabel();
}

// Render Tabel
function muatTabel() {
  const tabelBody = document.getElementById('tabelBody');
  const listSantri = JSON.parse(localStorage.getItem('takhasus_santri')) || [];

  tabelBody.innerHTML = '';

  if (listSantri.length === 0) {
    tabelBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-slate-400">Belum ada data tersimpan.</td></tr>`;
    return;
  }

  listSantri.forEach((santri, index) => {
    const tr = document.createElement('tr');
    tr.className = "border-b hover:bg-slate-50";
    tr.innerHTML = `
      <td class="p-3">${santri.tanggal}</td>
      <td class="p-3 font-semibold">${santri.nama}</td>
      <td class="p-3">${santri.juz}</td>
      <td class="p-3 font-bold text-emerald-600">${santri.nilaiHafalan}</td>
      <td class="p-3">${santri.nilaiAdab}</td>
      <td class="p-3"><span class="text-xs px-2 py-1 bg-slate-100 rounded border">${santri.status}</span></td>
      <td class="p-3 text-center">
        <button onclick="hapusData(${santri.id})" class="text-rose-600 hover:text-rose-800">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tabelBody.appendChild(tr);
  });
}

// Hapus Data
function hapusData(id) {
  if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
    let listSantri = JSON.parse(localStorage.getItem('takhasus_santri')) || [];
    listSantri = listSantri.filter(item => item.id !== id);
    localStorage.setItem('takhasus_santri', JSON.stringify(listSantri));
    muatTabel();
  }
}

// Kirim Ringkasan via WhatsApp
function kirimWhatsApp() {
  const nama = document.getElementById('namaSantri').value || '-';
  const juz = document.getElementById('juzUjian').value || '-';
  const nilaiHafalan = document.getElementById('totalNilaiHafalan').innerText;
  const nilaiAdab = document.getElementById('totalNilaiAdab').innerText;
  const status = document.getElementById('teksStatus').innerText;

  const pesan = `*Laporan Evaluasi Takhasus Al-Qur'an*%0A%0A` +
    `👤 *Nama:* ${nama}%0A` +
    `📖 *Materi:* ${juz}%0A` +
    `⭐ *Nilai Hafalan:* ${nilaiHafalan}/100%0A` +
    `🤲 *Nilai Adab & Karakter:* ${nilaiAdab}%0A` +
    `📌 *Status/Rekomendasi:* ${status}%0A%0A` +
    `_Baitul Qur'an Takhasus Program_`;

  window.open(`https://wa.me/?text=${pesan}`, '_blank');
}

// Export CSV
function exportCSV() {
  const listSantri = JSON.parse(localStorage.getItem('takhasus_santri')) || [];
  if (listSantri.length === 0) {
    alert("Tidak ada data untuk di-export!");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Tanggal,Nama,Juz,Nilai Hafalan,Nilai Adab,Status\n";
  listSantri.forEach(s => {
    csvContent += `"${s.tanggal}","${s.nama}","${s.juz}","${s.nilaiHafalan}","${s.nilaiAdab}","${s.status}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "rekap_penilaian_takhasus.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
