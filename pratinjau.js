/*
 * Pembagian halaman untuk pratinjau.
 *
 * docx-preview hanya memecah halaman pada pemisah halaman eksplisit, jadi
 * isi yang panjang tampil sebagai satu lembar sangat tinggi. Modul ini
 * membagi isinya menjadi halaman berukuran kertas dengan cara:
 *
 *  1. Membaca penanda paragraf (keepNext, pageBreakBefore, keepLines) dari
 *     document.xml pada berkas .docx yang sama dengan yang diunduh.
 *  2. Menyamakan tinggi baris dengan Word (spasi 1,15 dihitung dari tinggi
 *     baris asli Times New Roman, bukan dari ukuran huruf).
 *  3. Mengubah margin paragraf menjadi padding supaya jarak sebelum dan
 *     sesudah dijumlahkan seperti di Word (CSS biasanya menggabungkannya).
 *  4. Menyerahkan pemotongan halaman ke CSS multi-kolom: satu kolom = satu
 *     halaman, lengkap dengan aturan widow/orphan dan keep-with-next.
 *
 * Hasilnya perkiraan. Batas halaman di Word bisa bergeser satu atau dua
 * baris karena Word memakai mesin tata letaknya sendiri.
 */

(function (g) {

  "use strict";

  const NS_W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

  // Tinggi baris tunggal Times New Roman = 1,1499 x ukuran huruf
  // (ascent 1825 + descent 443 + lineGap 87 dari 2048 unit).
  const TNR_LINE = 1.1499;

  const FONT = '"Times New Roman", "Liberation Serif", Times, serif';

  // Jarak antarkolom (px). Tiap kolom mewakili satu halaman.
  const GAP = 60;

  // Batas penyusutan spasi antarkata (pecahan dari lebar spasi normal).
  const SUSUT = (typeof g.PV_SUSUT === "number") ? g.PV_SUSUT : 0.3;


  function px(v) {
    return parseFloat(v) || 0;
  }


  // ---------------------------------------------------
  // Perbaiki MathML dari docx-preview
  //
  // docx-preview menerjemahkan teks rumus menjadi <ms> (string literal) dan
  // membungkus subskrip multi-huruf dalam <mn> berisi banyak elemen. Browser
  // lalu menumpuk huruf-hurufnya ke bawah. Di sini <ms> diubah menjadi token
  // yang benar (<mi> huruf, <mn> angka, <mo> operator) dan <mn> yang berisi
  // elemen diganti <mrow>.
  // ---------------------------------------------------

  const NS_MML = "http://www.w3.org/1998/Math/MathML";

  function token(tag, teks) {

    const e = document.createElementNS(NS_MML, tag);

    e.textContent = teks;

    return e;

  }

  function perbaikiMathML(akar) {

    akar.querySelectorAll("math mn").forEach(mn => {

      if (!mn.children.length) return;

      const baris = document.createElementNS(NS_MML, "mrow");

      while (mn.firstChild) baris.appendChild(mn.firstChild);

      mn.replaceWith(baris);

    });

    akar.querySelectorAll("math ms").forEach(ms => {

      const frag = document.createDocumentFragment();

      const re = /[0-9]+(?:[.,][0-9]+)?|[A-Za-z\u0370-\u03FF]|\s+|./g;

      let m;

      while ((m = re.exec(ms.textContent))) {

        const t = m[0];

        if (/^\s+$/.test(t)) continue;

        if (/^[0-9]/.test(t)) {
          frag.appendChild(token("mn", t));
        } else if (/^[A-Za-z\u0370-\u03FF]$/.test(t)) {
          frag.appendChild(token("mi", t));
        } else {
          frag.appendChild(token("mo", t));
        }

      }

      ms.replaceWith(frag);

    });

  }


  // ---------------------------------------------------
  // Baca penanda paragraf dari document.xml
  // ---------------------------------------------------

  async function bacaPenanda(blob) {

    if (!g.JSZip) return null;

    try {

      const zip = await g.JSZip.loadAsync(blob);

      const xml = await zip
        .file("word/document.xml")
        .async("string");

      const doc = new DOMParser().parseFromString(xml, "application/xml");

      const body = doc.getElementsByTagNameNS(NS_W, "body")[0];

      const hasil = [];

      Array.from(body.children).forEach(el => {

        if (el.localName !== "p") return;

        const ppr = Array.from(el.children)
          .find(c => c.localName === "pPr");

        const ada = nama => {

          if (!ppr) return false;

          const node = Array.from(ppr.children)
            .find(c => c.localName === nama);

          if (!node) return false;

          const val = node.getAttributeNS(NS_W, "val");

          return val !== "0" && val !== "false";

        };

        hasil.push({
          keepNext: ada("keepNext"),
          keepLines: ada("keepLines"),
          pageBreakBefore: ada("pageBreakBefore")
        });

      });

      return hasil;

    } catch (e) {

      console.warn("Penanda paragraf tidak terbaca:", e);

      return null;

    }

  }


  // ---------------------------------------------------
  // Susun halaman
  // ---------------------------------------------------

  async function susun(wrapper, blob, opsi = {}) {

    const sections = Array.from(
      wrapper.querySelectorAll(":scope > section.docx")
    );

    if (!sections.length) return 0;

    perbaikiMathML(wrapper);


    // Ukuran kertas dan margin dibaca dari halaman pertama

    const cs0 = getComputedStyle(sections[0]);

    const pageW = sections[0].getBoundingClientRect().width;
    const pageH = px(cs0.minHeight) || sections[0].getBoundingClientRect().height;

    const padT = px(cs0.paddingTop);
    const padR = px(cs0.paddingRight);
    const padB = px(cs0.paddingBottom);
    const padL = px(cs0.paddingLeft);

    const contentW = pageW - padL - padR;
    const contentH = pageH - padT - padB;


    // Kumpulkan semua elemen isi menurut urutan dokumen

    const items = [];

    sections.forEach((sec, si) => {

      const art = sec.querySelector("article");

      if (!art) return;

      Array.from(art.children).forEach((el, ei) => {

        items.push({
          el,
          awalBagian: si > 0 && ei === 0
        });

      });

    });

    const paragraf = items.filter(i => i.el.tagName === "P");

    const penanda = await bacaPenanda(blob);

    const cocok = !!penanda && penanda.length === paragraf.length;

    if (!cocok) {
      console.warn(
        "Jumlah paragraf tidak cocok dengan document.xml; " +
        "aturan keep-with-next dilewati."
      );
    }


    // Wadah aliran: satu kolom = satu halaman

    const flow = document.createElement("div");

    flow.className = "pv-flow";

    Object.assign(flow.style, {
      width: contentW + "px",
      height: contentH + "px",
      columnWidth: contentW + "px",
      columnGap: GAP + "px",
      columnFill: "auto"
    });

    let indeksP = 0;

    items.forEach(item => {

      const el = item.el;

      if (el.tagName === "P") {

        const cs = getComputedStyle(el);

        const mt = px(cs.marginTop);
        const mb = px(cs.marginBottom);

        // Jarak sebelum dan sesudah dijumlahkan (seperti Word)

        // Jarak sebelum = padding (bisa dihapus di awal halaman).
        // Jarak sesudah = margin (terpotong di dasar halaman, seperti Word).

        el.style.marginTop = "0";
        el.style.marginBottom = mb + "px";
        el.style.paddingTop = mt + "px";
        el.style.paddingBottom = "0";
        el.dataset.padAtas = String(mt);

        // Gambar sebaris: tanpa celah di bawah baris (Word tidak menambahkannya)

        el.querySelectorAll("img").forEach(img => {
          img.style.verticalAlign = "top";
        });

        // Tinggi baris seperti Word

        el.style.fontFamily = FONT;

        const lh = parseFloat(el.style.lineHeight);

        if (isFinite(lh) && lh > 0 && lh < 10) {
          el.style.lineHeight = String(lh * TNR_LINE);
        }

        // Word (mode 2013 ke atas) menyusutkan spasi antarkata pada teks rata
        // kiri-kanan agar lebih banyak kata muat dalam satu baris. Chrome hanya
        // bisa melebarkan spasi, jadi penyusutan ditiru dengan spasi antarkata
        // negatif; setelah baris terbentuk, Chrome meratakannya penuh seperti biasa.

        if (el.style.textAlign === "justify" && SUSUT > 0) {
          el.style.wordSpacing = (-0.25 * SUSUT) + "em";
        }

        // Aturan pemotongan halaman

        el.style.orphans = "2";
        el.style.widows = "2";

        const tanda = cocok ? penanda[indeksP] : null;

        if (tanda) {

          if (tanda.keepNext) el.style.breakAfter = "avoid";
          if (tanda.keepLines) el.style.breakInside = "avoid";

          if (tanda.pageBreakBefore) {
            el.style.breakBefore = "column";
            el.dataset.pemisah = "1";
          }

        }

        indeksP++;

      }

      if (item.awalBagian) {
        el.style.breakBefore = "column";
        el.dataset.pemisah = "1";
      }

      flow.appendChild(el);

    });


    // Pasang pada bagian ukur (bagian kedua, atau pertama jika hanya satu)

    const ukur = sections[1] || sections[0];

    const artUkur = ukur.querySelector("article");

    artUkur.innerHTML = "";
    artUkur.appendChild(flow);

    sections.forEach(sec => {
      if (sec !== ukur) sec.style.display = "none";
    });


    // Hilangkan jarak sebelum paragraf yang jatuh di awal halaman
    // karena pemotongan otomatis (Word tidak menampilkannya di sana).

    if (opsi.hapusJarakAtasHalaman !== false) {

      const elemenP = paragraf.map(i => i.el);

      for (let putaran = 0; putaran < 4; putaran++) {

        const flowRect = flow.getBoundingClientRect();

        let berubah = false;

        elemenP.forEach(el => {

          const awal = px(el.dataset.padAtas);

          if (awal <= 0 || el.dataset.pemisah === "1") return;

          const rect = el.getClientRects()[0];

          if (!rect) return;

          const diKolomAtas =
            Math.abs(rect.top - flowRect.top) < 1.5;

          const sekarang = px(el.style.paddingTop);

          if (diKolomAtas && sekarang !== 0) {
            el.style.paddingTop = "0";
            berubah = true;
          }

          // Jika paragraf tidak lagi di awal halaman, kembalikan jaraknya

          if (!diKolomAtas && sekarang === 0) {
            el.style.paddingTop = awal + "px";
            berubah = true;
          }

        });

        if (!berubah) break;

      }

    }


    // Hitung jumlah halaman (kolom)

    const jumlah = Math.max(
      1,
      Math.round((flow.scrollWidth + GAP) / (contentW + GAP))
    );


    // Bangun halaman: tiap halaman menampilkan satu kolom lewat geseran

    const templat = flow;

    const artikelAsal = ukur.querySelector("article");

    const halaman = [];

    for (let k = 0; k < jumlah; k++) {

      const sec = sections[0].cloneNode(false);

      sec.style.display = "";
      sec.style.height = pageH + "px";
      sec.style.minHeight = pageH + "px";

      const art = document.createElement("article");

      Array.from(artikelAsal.attributes).forEach(a => {
        art.setAttribute(a.name, a.value);
      });

      const klip = document.createElement("div");

      klip.className = "pv-klip";

      Object.assign(klip.style, {
        position: "relative",
        width: contentW + "px",
        height: contentH + "px",
        overflow: "hidden"
      });

      const salinan = templat.cloneNode(true);

      Object.assign(salinan.style, {
        position: "absolute",
        left: "0",
        top: "0",
        transform: "translateX(" + (-k * (contentW + GAP)) + "px)"
      });

      klip.appendChild(salinan);
      art.appendChild(klip);
      sec.appendChild(art);

      halaman.push(sec);

    }

    wrapper.innerHTML = "";

    halaman.forEach((sec, k) => {

      wrapper.appendChild(sec);

      const label = document.createElement("div");

      label.className = "pv-label";
      label.textContent = "Halaman " + (k + 1) + " dari " + jumlah;

      wrapper.appendChild(label);

    });

    return jumlah;

  }


  g.PaginasiPratinjau = { susun };

})(typeof window !== "undefined" ? window : globalThis);
