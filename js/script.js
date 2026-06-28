/* ─── SCROLL REVEAL ─── */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

/* ─── MOBILE NAV ─── */
function toggleMobileNav() {
    document.getElementById('mobileNav').classList.toggle('open');
}

/* ─── TEACHER FILTER ─── */
function filterTeachers(dept, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#teacherGrid .teacher-card').forEach(card => {
        const match = dept === 'semua' || card.dataset.dept === dept;
        card.style.display = match ? '' : 'none';
    });
}

/* ─── STRUKTUR FILTER ─── */
function filterStruktur(group, btn) {
    document.querySelectorAll('.struktur-controls .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const allBlocks = document.querySelectorAll('#orgTree .org-block');
    const allConns  = document.querySelectorAll('#orgTree .org-level-connector');
    if (group === 'semua') {
        allBlocks.forEach(el => el.style.display = '');
        allConns.forEach(el  => el.style.display = '');
        return;
    }
    allBlocks.forEach(el => el.style.display = 'none');
    allConns.forEach(el  => el.style.display = 'none');
    allBlocks.forEach(block => {
        if (block.getAttribute('data-group') === group) block.style.display = '';
    });
}

/* ─── CAROUSEL ─── */
let carouselPos = 0;
const CARDS_PER_VIEW = window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 4;
function buildDots() {
    const dots = document.getElementById('carouselDots');
    if (!dots) return;
    const total = document.querySelectorAll('.ekskul-card').length;
    const pages = Math.ceil(total / CARDS_PER_VIEW);
    dots.innerHTML = '';
    for (let i = 0; i < pages; i++) {
        const d = document.createElement('div');
        d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dots.appendChild(d);
    }
}
function moveCarousel(dir) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const cards = document.querySelectorAll('.ekskul-card');
    const total = cards.length;
    const pages = Math.ceil(total / CARDS_PER_VIEW);
    carouselPos = (carouselPos + dir + pages) % pages;
    const cardWidth = track.querySelector('.ekskul-card').offsetWidth;
    const gap = 20;
    track.style.transform = `translateX(-${carouselPos * (CARDS_PER_VIEW * (cardWidth + gap))}px)`;
    document.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === carouselPos));
}
buildDots();

/* ─── DATA TABS ─── */
function switchTab(tabId, btn) {
    document.querySelectorAll('.data-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.data-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

/* ─── TABLE SEARCH ─── */
function searchTable(tableId, query) {
    const rows = document.querySelectorAll('#' + tableId + ' tbody tr');
    const q = query.toLowerCase();
    rows.forEach(row => {
        const match = row.textContent.toLowerCase().includes(q);
        row.style.display = match ? '' : 'none';
    });
}

/* ─── TOAST ─── */
function showToast(msg, icon) {
    icon = icon || '✅';
    const t = document.getElementById('toast');
    if (!t) return;
    document.getElementById('toastMsg').textContent = msg;
    document.getElementById('toastIcon').textContent = icon;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ─── HELPER: set <select> value by text or value ─── */
function setSelectValue(selectId, value) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === value || sel.options[i].textContent.trim() === value) {
            sel.selectedIndex = i;
            return;
        }
    }
    sel.selectedIndex = 0;
}

/* ─── MODAL ─── */
let currentEditId   = null;
let currentEditType = null;
let _fotoBase64     = '';

/* simpan data baris yang sedang di-edit (hasil dari Supabase), supaya
   form modal bisa di-isi tanpa harus parsing teks dari tabel */
let _editRowCache = null;

/* cache hasil fetch terakhir per tabel — dipakai openModal() buat ambil
   data baris yang di-edit, TANPA embed JSON di atribut onclick HTML
   (yang rawan rusak kalau ada foto base64 panjang) */
let _guruDataCache      = [];
let _fasilitasDataCache = [];
let _ekskulDataCache    = [];

function openModal(modalId, editId, rowData) {
    currentEditId   = editId;
    currentEditType = modalId;

    /* kalau rowData nggak dikirim langsung (sengaja, biar nggak embed
       JSON gede di HTML), ambil dari cache hasil load terakhir */
    if (editId !== null && editId !== undefined && !rowData) {
        if (modalId === 'modal-guru')      rowData = _guruDataCache.find(g => g.id === editId);
        if (modalId === 'modal-fasilitas') rowData = _fasilitasDataCache.find(f => f.id === editId);
        if (modalId === 'modal-ekskul')    rowData = _ekskulDataCache.find(e => e.id === editId);
    }

    _editRowCache   = rowData || null;

    /* ── GURU ── */
    if (modalId === 'modal-guru') {
        const titleEl = document.getElementById('modal-guru-title');
        if (titleEl) titleEl.textContent = editId !== null ? 'Edit Data Guru' : 'Tambah Data Guru';

        _fotoBase64 = '';
        const preview   = document.getElementById('mg-foto-preview');
        const fotoInput = document.getElementById('mg-foto');
        if (preview)   { preview.src = ''; preview.style.display = 'none'; }
        if (fotoInput) fotoInput.value = '';

        if (editId !== null && rowData) {
            document.getElementById('mg-nama').value  = rowData.nama  || '';
            document.getElementById('mg-jabatan').value = rowData.jabatan || '';
            document.getElementById('mg-mapel').value = rowData.mapel || '';
            setSelectValue('mg-pendidikan', rowData.pendidikan || 'S1');
            document.getElementById('mg-exp').value   = rowData.pengalaman || '';
            setSelectValue('mg-status', rowData.status || 'Aktif');

            if (rowData.foto_url && preview) {
                _fotoBase64 = rowData.foto_url;
                preview.src = rowData.foto_url;
                preview.style.display = 'block';
            }
        } else {
            document.getElementById('mg-nama').value  = '';
            document.getElementById('mg-jabatan').value = '';
            document.getElementById('mg-mapel').value = '';
            setSelectValue('mg-pendidikan', 'S1');
            document.getElementById('mg-exp').value   = '';
            setSelectValue('mg-status', 'Aktif');
        }
    }

    /* ── FASILITAS ── */
    if (modalId === 'modal-fasilitas') {
        const titleEl = document.getElementById('modal-fasilitas-title');
        if (titleEl) titleEl.textContent = editId !== null ? 'Edit Fasilitas' : 'Tambah Fasilitas';

        if (editId !== null && rowData) {
            document.getElementById('mf-nama').value   = rowData.nama || '';
            document.getElementById('mf-kap').value    = rowData.kapasitas || '';
            setSelectValue('mf-kondisi', rowData.kondisi || 'Sangat Baik');
            document.getElementById('mf-lokasi').value = rowData.lokasi || '';
            setSelectValue('mf-status', rowData.status || 'Tersedia');
        } else {
            document.getElementById('mf-nama').value   = '';
            document.getElementById('mf-kap').value    = '';
            setSelectValue('mf-kondisi', 'Sangat Baik');
            document.getElementById('mf-lokasi').value = '';
            setSelectValue('mf-status', 'Tersedia');
        }
    }

    /* ── EKSKUL ── */
    if (modalId === 'modal-ekskul') {
        const titleEl = document.getElementById('modal-ekskul-title');
        if (titleEl) titleEl.textContent = editId !== null ? 'Edit Ekskul' : 'Tambah Ekskul';

        if (editId !== null && rowData) {
            document.getElementById('me-nama').value     = rowData.nama || '';
            document.getElementById('me-pembina').value  = rowData.pembina || '';
            document.getElementById('me-jadwal').value   = rowData.jadwal || '';
            document.getElementById('me-anggota').value  = rowData.anggota || '';
            document.getElementById('me-prestasi').value = (rowData.prestasi && rowData.prestasi !== '—') ? rowData.prestasi : '';
        } else {
            document.getElementById('me-nama').value     = '';
            document.getElementById('me-pembina').value  = '';
            document.getElementById('me-jadwal').value   = '';
            document.getElementById('me-anggota').value  = '';
            document.getElementById('me-prestasi').value = '';
        }
    }

    const overlay = document.getElementById(modalId);
    if (overlay) overlay.classList.add('open');
}

function closeModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) overlay.classList.remove('open');
    currentEditId = null;
    _fotoBase64   = '';
}

/* close modal on backdrop click */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) closeModal(this.id);
    });
});

/* ─── FOTO PREVIEW ─── */
(function () {
    const fotoInput = document.getElementById('mg-foto');
    if (!fotoInput) return;
    fotoInput.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            _fotoBase64 = e.target.result;
            const preview = document.getElementById('mg-foto-preview');
            if (preview) { preview.src = _fotoBase64; preview.style.display = 'block'; }
        };
        reader.readAsDataURL(file);
    });
})();

/* ─── CRUD: DELETE ROW (Supabase) ─── */
async function deleteRow(tbodyId, id) {
    if (!confirm('Yakin ingin menghapus data ini?')) return;

    const tableMap = {
        teacherTableBody  : 'guru',
        fasilitasTableBody: 'fasilitas',
        ekskriTableBody   : 'ekskul',
        siswaTableBody    : 'siswa'
    };
    const table = tableMap[tbodyId];
    if (!table) return;

    const { error } = await supabaseClient.from(table).delete().eq('id', id);
    if (error) { showToast('Gagal menghapus: ' + error.message, '⚠️'); console.error(error); return; }

    showToast('Data berhasil dihapus.', '🗑️');

    if (table === 'guru')      { await loadGuruFromStorage(); }
    if (table === 'fasilitas') { await loadFasilitasFromStorage(); }
    if (table === 'ekskul')    { await loadEkskulFromStorage(); }
    if (table === 'siswa')     { await loadSiswaFromStorage(); }
}

/* ─── CRUD: SAVE GURU (Supabase) ─── */
async function saveGuruRow() {
    const nama   = document.getElementById('mg-nama').value.trim();
    const jabatan= document.getElementById('mg-jabatan').value.trim();
    const mapel  = document.getElementById('mg-mapel').value.trim();
    const pend   = document.getElementById('mg-pendidikan').value;
    const exp    = document.getElementById('mg-exp').value.trim();
    const status = document.getElementById('mg-status').value;

    if (!nama || !mapel) { showToast('Nama dan mata pelajaran wajib diisi.', '⚠️'); return; }

    const payload = {
        nama       : nama,
        jabatan    : jabatan || null,
        mapel      : mapel,
        pendidikan : pend,
        pengalaman : exp || null,
        status     : status
    };
    if (_fotoBase64) payload.foto_url = _fotoBase64;

    let error;
    if (currentEditId !== null) {
        ({ error } = await supabaseClient.from('guru').update(payload).eq('id', currentEditId));
    } else {
        ({ error } = await supabaseClient.from('guru').insert(payload));
    }

    if (error) { showToast('Gagal menyimpan: ' + error.message, '⚠️'); console.error(error); return; }

    showToast(currentEditId !== null ? 'Data guru berhasil diperbarui.' : 'Guru baru berhasil ditambahkan.');
    closeModal('modal-guru');
    await loadGuruFromStorage();
}

/* ─── CRUD: SAVE FASILITAS (Supabase) ─── */
async function saveFasRow() {
    const nama    = document.getElementById('mf-nama').value.trim();
    const kap     = document.getElementById('mf-kap').value.trim();
    const kondisi = document.getElementById('mf-kondisi').value;
    const lok     = document.getElementById('mf-lokasi').value.trim();
    const status  = document.getElementById('mf-status').value;

    if (!nama) { showToast('Nama fasilitas wajib diisi.', '⚠️'); return; }

    const payload = {
        nama     : nama,
        kapasitas: kap || null,
        kondisi  : kondisi,
        lokasi   : lok || null,
        status   : status
    };

    let error;
    if (currentEditId !== null) {
        ({ error } = await supabaseClient.from('fasilitas').update(payload).eq('id', currentEditId));
    } else {
        ({ error } = await supabaseClient.from('fasilitas').insert(payload));
    }

    if (error) { showToast('Gagal menyimpan: ' + error.message, '⚠️'); console.error(error); return; }

    showToast(currentEditId !== null ? 'Fasilitas berhasil diperbarui.' : 'Fasilitas berhasil ditambahkan.');
    closeModal('modal-fasilitas');
    await loadFasilitasFromStorage();
}

/* ─── CRUD: SAVE EKSKUL (Supabase) ─── */
async function saveEkskulRow() {
    const nama     = document.getElementById('me-nama').value.trim();
    const pembina  = document.getElementById('me-pembina').value.trim();
    const jadwal   = document.getElementById('me-jadwal').value.trim();
    const anggota  = document.getElementById('me-anggota').value.trim();
    const prestasi = document.getElementById('me-prestasi').value.trim();

    if (!nama) { showToast('Nama ekskul wajib diisi.', '⚠️'); return; }

    const payload = {
        nama    : nama,
        pembina : pembina  || null,
        jadwal  : jadwal   || null,
        anggota : anggota  || null,
        prestasi: prestasi || null
    };

    let error;
    if (currentEditId !== null) {
        ({ error } = await supabaseClient.from('ekskul').update(payload).eq('id', currentEditId));
    } else {
        ({ error } = await supabaseClient.from('ekskul').insert(payload));
    }

    if (error) { showToast('Gagal menyimpan: ' + error.message, '⚠️'); console.error(error); return; }

    showToast(currentEditId !== null ? 'Ekskul berhasil diperbarui.' : 'Ekskul berhasil ditambahkan.');
    closeModal('modal-ekskul');
    await loadEkskulFromStorage();
}

/* ══════════════════════════════════════════════
   PERSISTENSI — SUPABASE (pengganti localStorage)
   Data tersimpan di database cloud, bisa diakses
   dari perangkat & browser manapun.
   ══════════════════════════════════════════════ */

/* ── GURU ── */
async function loadGuruFromStorage() {
    /* cek dulu apakah halaman ini emang butuh data guru (tabel admin
       ATAU grid publik) — kalau dua-duanya nggak ada di halaman ini,
       jangan query ke Supabase sama sekali (hemat resource & bandwidth) */
    const tbody = document.getElementById('teacherTableBody');
    const grid  = document.getElementById('teacherGrid');
    if (!tbody && !grid) return;

    const { data, error } = await supabaseClient.from('guru').select('*').order('id', { ascending: true });
    if (error) { console.error('Gagal memuat data guru:', error); return; }

    _guruDataCache = data || [];

    /* ── data-akademik.html: render tabel admin ── */
    if (tbody) {
        tbody.innerHTML = '';
        (data || []).forEach(guru => {
            const statusClass = guru.status === 'Aktif' ? 'status-active' : 'status-inactive';
            const row = document.createElement('tr');
            row.setAttribute('data-id', guru.id);
            row.innerHTML =
                '<td>' + guru.nama + '</td>' +
                '<td>' + (guru.jabatan || '—') + '</td>' +
                '<td>' + guru.mapel + '</td>' +
                '<td>' + (guru.pendidikan || '') + '</td>' +
                '<td>' + (guru.pengalaman || '—') + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + guru.status + '</span></td>' +
                '<td>' +
                    '<button class="action-btn" onclick="openModal(\'modal-guru\',' + guru.id + ')" title="Edit">✏️</button>' +
                    '<button class="action-btn del" onclick="deleteRow(\'teacherTableBody\',' + guru.id + ')" title="Hapus">🗑️</button>' +
                '</td>';
            tbody.appendChild(row);
        });
        return;
    }

    /* ── guru.html: render kartu publik ── */
    if (!grid || !data || !data.length) return;

    const deptMap = {
        'Biologi':'ipa','Kimia':'ipa','Fisika':'ipa','Matematika':'ipa',
        'Ekonomi':'ips','Sosiologi':'ips','Geografi':'ips','Sejarah':'ips','Akuntansi':'ips',
        'Bahasa Indonesia':'bahasa','Bahasa Inggris':'bahasa',
        'Informatika':'tek',
        'PJOK':'pend','PPKn':'pend','Pendidikan Agama Islam':'pend'
    };
    const bgColors = ['avatar-bg-1','avatar-bg-2','avatar-bg-3','avatar-bg-4',
                      'avatar-bg-5','avatar-bg-6','avatar-bg-7','avatar-bg-8'];

    grid.innerHTML = '';
    data.forEach(function(guru, i) {
        const dept     = deptMap[guru.mapel] || 'semua';
        const initials = guru.nama.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
        const bg       = bgColors[i % 8];

        let avatarHTML;
        if (guru.foto_url) {
            avatarHTML =
                '<img src="' + guru.foto_url + '" ' +
                'style="width:100%;height:100%;object-fit:cover;border-radius:50%;object-position:top center" ' +
                'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
                '<span class="avatar-initials" style="display:none">' + initials + '</span>';
        } else {
            avatarHTML = '<span class="avatar-initials" style="display:flex">' + initials + '</span>';
        }

        const card = document.createElement('div');
        card.className    = 'teacher-card reveal visible';
        card.dataset.dept = dept;
        card.innerHTML =
            '<div class="teacher-avatar ' + bg + '">' + avatarHTML + '</div>' +
            '<div class="teacher-info">' +
                '<div class="teacher-name">'    + guru.nama   + '</div>' +
                '<div class="teacher-subject">' + (guru.jabatan || guru.status) + '</div>' +
                '<div class="teacher-mapel">'   + guru.mapel  + (guru.pengalaman ? ' · ' + guru.pengalaman : '') + '</div>' +
            '</div>';
        grid.appendChild(card);
    });
}

/* ── FASILITAS ── */
async function loadFasilitasFromStorage() {
    const tbody = document.getElementById('fasilitasTableBody');
    if (!tbody) return;

    const { data, error } = await supabaseClient.from('fasilitas').select('*').order('id', { ascending: true });
    if (error) { console.error('Gagal memuat data fasilitas:', error); return; }

    _fasilitasDataCache = data || [];

    tbody.innerHTML = '';
    (data || []).forEach(f => {
        const statusClass = f.status === 'Tersedia' ? 'status-active' : 'status-inactive';
        const row = document.createElement('tr');
        row.setAttribute('data-id', f.id);
        row.innerHTML =
            '<td>' + f.nama + '</td><td>' + (f.kapasitas || '—') + '</td><td>' + f.kondisi + '</td><td>' + (f.lokasi || '—') + '</td>' +
            '<td><span class="status-badge ' + statusClass + '">' + f.status + '</span></td>' +
            '<td>' +
                '<button class="action-btn" onclick="openModal(\'modal-fasilitas\',' + f.id + ')">✏️</button>' +
                '<button class="action-btn del" onclick="deleteRow(\'fasilitasTableBody\',' + f.id + ')">🗑️</button>' +
            '</td>';
        tbody.appendChild(row);
    });
}

/* ── EKSKUL ── */
async function loadEkskulFromStorage() {
    const tbody = document.getElementById('ekskriTableBody');
    if (!tbody) return;

    const { data, error } = await supabaseClient.from('ekskul').select('*').order('id', { ascending: true });
    if (error) { console.error('Gagal memuat data ekskul:', error); return; }

    _ekskulDataCache = data || [];

    tbody.innerHTML = '';
    (data || []).forEach(e => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', e.id);
        row.innerHTML =
            '<td>' + e.nama + '</td><td>' + (e.pembina || '—') + '</td><td>' + (e.jadwal || '—') + '</td>' +
            '<td>' + (e.anggota || '—') + '</td><td>' + (e.prestasi || '—') + '</td>' +
            '<td>' +
                '<button class="action-btn" onclick="openModal(\'modal-ekskul\',' + e.id + ')">✏️</button>' +
                '<button class="action-btn del" onclick="deleteRow(\'ekskriTableBody\',' + e.id + ')">🗑️</button>' +
            '</td>';
        tbody.appendChild(row);
    });
}

/* ── init semua saat halaman load ── */
loadGuruFromStorage();
loadFasilitasFromStorage();
loadEkskulFromStorage();

/* ════════════════════════════════════════════════════════════
   OFFLINE FALLBACK — VERSI 1
   Kalau submit PPDB gagal terhubung ke Supabase, data disimpan
   sementara di localStorage browser pengisi form, supaya tidak
   hilang. Admin bisa sinkronkan manual lewat tombol "Sync" di
   panel data-akademik (kalau dibuka di device yang sama).
   ════════════════════════════════════════════════════════════ */
const OFFLINE_SISWA_KEY = 'stj_offline_siswa';

function getOfflineSiswa() {
    try { return JSON.parse(localStorage.getItem(OFFLINE_SISWA_KEY)) || []; }
    catch (e) { return []; }
}
function saveOfflineSiswaList(list) {
    localStorage.setItem(OFFLINE_SISWA_KEY, JSON.stringify(list));
}
function addOfflineSiswa(record) {
    const list = getOfflineSiswa();
    record._offlineId = 'OFF-' + Date.now();
    list.push(record);
    saveOfflineSiswaList(list);
    return record;
}
async function syncOfflineSiswa(offlineId) {
    const list = getOfflineSiswa();
    const idx  = list.findIndex(s => s._offlineId === offlineId);
    if (idx === -1) return;

    const record = Object.assign({}, list[idx]);
    delete record._offlineId;
    if (record.status === 'Menunggu (Offline)') record.status = 'Menunggu';

    const { error } = await supabaseClient.from('siswa').insert(record);
    if (error) { showToast('Gagal sinkron: ' + error.message, '⚠️'); return; }

    list.splice(idx, 1);
    saveOfflineSiswaList(list);
    showToast('Data berhasil disinkronkan ke database.', '✅');
    await loadSiswaFromStorage();
}

/* ─── PPDB FORM VALIDATION ─── */
function validateField(id, errId, condition) {
    const el = document.getElementById(errId);
    if (!el) return condition;
    if (!condition) { el.classList.add('visible'); return false; }
    el.classList.remove('visible'); return true;
}

async function submitPPDB(e) {
    e.preventDefault();

    const nik    = document.getElementById('ppdb-nik')    ? document.getElementById('ppdb-nik').value.trim()    : '';
    const nisn   = document.getElementById('ppdb-nisn')   ? document.getElementById('ppdb-nisn').value.trim()   : '';
    const nama   = document.getElementById('ppdb-nama').value.trim();
    const jk     = document.getElementById('ppdb-jk').value;
    const ttl    = document.getElementById('ppdb-ttl').value.trim();
    const dob    = document.getElementById('ppdb-dob').value;
    const alamat = document.getElementById('ppdb-alamat') ? document.getElementById('ppdb-alamat').value.trim() : '';
    const hp     = document.getElementById('ppdb-hp').value.trim();
    const asal   = document.getElementById('ppdb-asal').value.trim();
    const jalur  = document.getElementById('ppdb-jalur').value;

    const valid = [
        validateField('ppdb-nik',    'err-nik',    !nik    || /^\d{16}$/.test(nik)),
        validateField('ppdb-nisn',   'err-nisn',   !nisn   || /^\d{10}$/.test(nisn)),
        validateField('ppdb-nama',   'err-nama',   nama.length >= 3),
        validateField('ppdb-jk',     'err-jk',     jk !== ''),
        validateField('ppdb-ttl',    'err-ttl',    ttl.length > 0),
        validateField('ppdb-dob',    'err-dob',    dob.length > 0),
        validateField('ppdb-alamat', 'err-alamat', !alamat || alamat.length > 0),
        validateField('ppdb-hp',     'err-hp',     hp.replace(/\D/g,'').length >= 10),
        validateField('ppdb-asal',   'err-asal',   asal.length > 0),
        validateField('ppdb-jalur',  'err-jalur',  jalur !== ''),
    ].every(Boolean);
    if (!valid) return;

    const jalurLabels = {
        'zonasi'         : 'Zonasi',
        'afirmasi'       : 'Afirmasi / KETM',
        'prestasi-rapor' : 'Prestasi Nilai Rapor',
        'prestasi-lomba' : 'Prestasi Perlombaan',
        'pindah'         : 'Perpindahan Tugas Ortu/Wali'
    };

    /* tombol submit di-nonaktifkan sementara agar tidak double-submit */
    const submitBtn = e.target.querySelector('button[type="submit"], .btn-submit-ppdb');
    if (submitBtn) submitBtn.disabled = true;

    const { error } = await supabaseClient.from('siswa').insert({
        nama         : nama,
        nik          : nik  || null,
        nisn         : nisn || null,
        jenis_kelamin: jk,
        tempat_lahir : ttl,
        tanggal_lahir: dob,
        alamat       : alamat || null,
        no_hp        : hp,
        asal_sekolah : asal,
        jalur        : jalurLabels[jalur] || jalur,
        status       : 'Menunggu'
    });

    if (submitBtn) submitBtn.disabled = false;

    if (error) {
        /* ── FALLBACK OFFLINE: simpan ke localStorage browser ini ── */
        addOfflineSiswa({
            nama         : nama,
            nik          : nik  || null,
            nisn         : nisn || null,
            jenis_kelamin: jk,
            tempat_lahir : ttl,
            tanggal_lahir: dob,
            alamat       : alamat || null,
            no_hp        : hp,
            asal_sekolah : asal,
            jalur        : jalurLabels[jalur] || jalur,
            status       : 'Menunggu (Offline)'
        });
        console.warn('Gagal terhubung ke Supabase, PPDB disimpan offline:', error);

        document.getElementById('ppdbForm').style.display = 'none';
        document.getElementById('ppdbSuccess').classList.add('visible');
        showToast('Koneksi gagal — pendaftaran disimpan sementara di perangkat ini, akan disinkronkan saat online.', '📴');
        return;
    }

    document.getElementById('ppdbForm').style.display = 'none';
    document.getElementById('ppdbSuccess').classList.add('visible');
    showToast('Pendaftaran berhasil!', '🎉');
}

/* ── SISWA: load data di data-akademik (tab Calon Siswa/PPDB) ── */
async function loadSiswaFromStorage() {
    const tbody = document.getElementById('siswaTableBody');
    if (!tbody) return;

    const { data, error } = await supabaseClient.from('siswa').select('*').order('id', { ascending: true });
    const offlineList = getOfflineSiswa();

    if (error) {
        console.error('Gagal memuat data siswa dari Supabase:', error);
    }

    tbody.innerHTML = '';

    (data || []).forEach(s => {
        const statusClass = s.status === 'Diverifikasi' ? 'status-active' : 'status-inactive';
        const row = document.createElement('tr');
        row.setAttribute('data-id', s.id);
        row.innerHTML =
            '<td>' + s.nama + '</td><td>' + s.asal_sekolah + '</td><td>' + s.jalur + '</td>' +
            '<td>' + (s.nisn || '-') + '</td><td>—</td>' +
            '<td><span class="status-badge ' + statusClass + '">' + s.status + '</span></td>' +
            '<td><button class="action-btn del" onclick="deleteRow(\'siswaTableBody\',' + s.id + ')">🗑️</button></td>';
        tbody.appendChild(row);
    });

    /* ── render data offline yang masih nunggu sinkron (kalau ada di device ini) ── */
    offlineList.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML =
            '<td>' + s.nama + '</td><td>' + s.asal_sekolah + '</td><td>' + s.jalur + '</td>' +
            '<td>' + (s.nisn || '-') + '</td><td>—</td>' +
            '<td><span class="status-badge status-inactive">⏳ Offline (belum sync)</span></td>' +
            '<td><button class="action-btn" onclick="syncOfflineSiswa(\'' + s._offlineId + '\')" title="Sinkronkan">🔄 Sync</button></td>';
        tbody.appendChild(row);
    });
}
loadSiswaFromStorage();
/* ═══════════════════════════════════════════════════════════════
   COLOR THEME SWITCHER
   ═══════════════════════════════════════════════════════════════ */
(function initThemeSwitcher() {
    const saved = localStorage.getItem('stj-theme') || 'default';
    applyTheme(saved);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyTheme(btn.dataset.theme);
            localStorage.setItem('stj-theme', btn.dataset.theme);
        });
    });
})();

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'default' ? '' : theme);
    document.querySelectorAll('.theme-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.theme === theme);
    });
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVE NAV LINK (auto-detect by current page)
   ═══════════════════════════════════════════════════════════════ */
(function setActiveNav() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        const hrefPage = href.split('/').pop().split('#')[0] || 'index.html';
        if (hrefPage === page || (page === '' && hrefPage === 'index.html')) {
            a.classList.add('nav-active');
        }
    });
})();

/* ─── ADMIN LOGOUT ─── */
async function logoutAdmin() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}
