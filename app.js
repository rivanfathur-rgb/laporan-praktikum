(function (g) {
  const D = g.docx;
  const { Document, Paragraph, TextRun, AlignmentType, MathRun, MathFraction, MathSubScript,
    MathSuperScript, MathSubSuperScript, MathSum, LevelFormat, TabStopType, LineRuleType, Tab } = D;
  const MathX = D.Math;

  // ====== PENGATURAN FORMAT (ubah di sini setelah evaluasi) ======
  const CFG = {
    font: "Times New Roman",
    size: 24,        // 24 = 12 pt
    line: 360,       // 240 = spasi 1, 360 = spasi 1,5
    after: 0,        // jarak antarparagraf (satuan twip, 120 = 6 pt)
    indent: 720,     // menjorok baris pertama (720 = 1,27 cm)
    margin: { top: 1701, right: 1701, bottom: 1701, left: 2268 } // 3,3,3 cm dan kiri 4 cm
  };

  // ====== LaTeX -> rumus Word ======
  const G = { alpha: "α", beta: "β", gamma: "γ", delta: "δ", Delta: "Δ", theta: "θ", lambda: "λ",
    mu: "μ", pi: "π", sigma: "σ", omega: "ω", Omega: "Ω", phi: "φ", tau: "τ", epsilon: "ε",
    cdot: "⋅", times: "×", pm: "±", approx: "≈", neq: "≠", leq: "≤", geq: "≥", lvert: "|",
    rvert: "|", infty: "∞", rightarrow: "→", div: "÷", degree: "°" };

  function texToMath(src) {
    let i = 0;
    const ws = () => { while (src[i] === " ") i++; };
    const group = () => { i++; const n = seq("}"); i++; return n; };
    const arg = () => { ws(); return src[i] === "{" ? group() : atom(); };
    function atom() {
      ws();
      const c = src[i];
      if (c === "{") return group();
      if (c === "\\") {
        i++;
        const m = /^[a-zA-Z]+/.exec(src.slice(i));
        if (!m) return [new MathRun(src[i++] || "")];
        const cmd = m[0]; i += cmd.length;
        if (cmd === "frac") { const a = arg(), b = arg(); return [new MathFraction({ numerator: a, denominator: b })]; }
        if (cmd === "text" || cmd === "mathrm") {
          ws(); let t = "";
          if (src[i] === "{") { i++; while (i < src.length && src[i] !== "}") t += src[i++]; i++; }
          return [new MathRun(t)];
        }
        if (cmd === "sum") {
          let sub, sup; ws();
          while (src[i] === "_" || src[i] === "^") { const k = src[i++]; const a = arg(); if (k === "_") sub = a; else sup = a; ws(); }
          const body = (i < src.length && src[i] !== "}") ? atom() : [];
          return [new MathSum({ children: body, subScript: sub, superScript: sup })];
        }
        return [new MathRun(G[cmd] || "\\" + cmd)];
      }
      i++;
      return [new MathRun(c)];
    }
    function seq(end) {
      const out = [];
      while (i < src.length) {
        ws();
        if (i >= src.length || src[i] === end) break;
        let base = atom(), sub, sup;
        for (;;) {
          ws();
          if (src[i] === "_") { i++; sub = arg(); } else if (src[i] === "^") { i++; sup = arg(); } else break;
        }
        if (sub && sup) base = [new MathSubSuperScript({ children: base, subScript: sub, superScript: sup })];
        else if (sub) base = [new MathSubScript({ children: base, subScript: sub })];
        else if (sup) base = [new MathSuperScript({ children: base, superScript: sup })];
        out.push(...base);
      }
      return out;
    }
    return new MathX({ children: seq(null) });
  }

  // ====== teks, paragraf, daftar ======
  const tr = (t, o) => new TextRun({ text: t, font: CFG.font, size: CFG.size, ...o });
  const SP = { line: CFG.line, lineRule: LineRuleType.AUTO, after: CFG.after };

  function runs(text, extra) {
    const out = [];
    text.split(/(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*)/).forEach(p => {
      if (!p) return;
      if (p[0] === "$" && p.length > 2) out.push(texToMath(p.slice(1, -1)));
      else if (p.startsWith("**") && p.length > 4) out.push(tr(p.slice(2, -2), { ...extra, bold: true }));
      else if (p[0] === "*" && p.length > 2) out.push(tr(p.slice(1, -1), { ...extra, italics: true }));
      else out.push(tr(p, extra));
    });
    return out;
  }

  const lines = s => (s || "").split("\n").map(x => x.trim()).filter(Boolean);
  let inst = 0;
  const item = (t, ref, k) => new Paragraph({ numbering: { reference: ref, level: 0, instance: k }, alignment: AlignmentType.JUSTIFIED, spacing: SP, children: runs(t) });

  function list(text, ref) { const k = ++inst; return lines(text).map(t => item(t, ref, k)); }

  function body(text) {
    const out = []; let k = 0;
    lines(text).forEach(t => {
      if (t.startsWith("- ")) { if (!k) k = ++inst; out.push(item(t.slice(2), "abc", k)); return; }
      k = 0;
      if (t.startsWith("## ")) out.push(new Paragraph({ spacing: { ...SP, before: 120 }, keepNext: true, children: [tr(t.slice(3), { bold: true })] }));
      else if (/^\$[^$]+\$$/.test(t)) out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: SP, children: runs(t) }));
      else if (/^(Gambar|Tabel) /.test(t)) out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: SP, children: runs(t, { italics: true }) }));
      else out.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: SP, indent: { firstLine: CFG.indent }, children: runs(t) }));
    });
    return out;
  }

  const head = (num, title, brk) => new Paragraph({
    spacing: { ...SP, before: brk ? 0 : 120 }, keepNext: true, pageBreakBefore: !!brk,
    tabStops: [{ type: TabStopType.LEFT, position: 567 }],
    children: [tr(num, { bold: true }), new TextRun({ children: [new Tab(), title], bold: true, font: CFG.font, size: CFG.size })]
  });
  const plainHead = t => new Paragraph({ spacing: { ...SP, before: 240 }, keepNext: true, children: [tr(t, { bold: true })] });

  function build(d) {
    const C = (t, o = {}, sp = SP) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp, children: [tr(t, o)] });
    const one = { line: 240, lineRule: LineRuleType.AUTO, after: 0 };
    const cover = [
      C("LAPORAN PRAKTIKUM MODUL " + d.modul, { bold: true }),
      C((d.judul || "").toUpperCase(), { bold: true }), C(""),
      C("Disusun untuk Memenuhi Mata Kuliah " + d.matkul), C("Dibimbing oleh " + d.dosen), C(""),
      C("Disusun Oleh:"), C(""),
      C((d.nama || "").toUpperCase()), C("NIM. " + d.nim), C(d.kelas),
      new Paragraph({ spacing: { before: 3800 }, children: [] }), // ruang untuk logo (sisipkan manual di Word)
      ...lines(d.institusi).map(t => C(t, { bold: true }, one)),
      C((d.waktu || "").toUpperCase(), { bold: true }, one)
    ];
    const bab = [
      head("I", "PENDAHULUAN", true),
      head("A.", "LATAR BELAKANG"), ...body(d.latar),
      head("B.", "TUJUAN PRAKTIKUM"), ...list(d.tujuan, "abc"),
      head("II", "DASAR TEORI"), ...body(d.teori),
      head("III", "ALAT DAN BAHAN"), ...list(d.alat, "bul"),
      head("IV", "PROSEDUR PERCOBAAN"), ...body(d.prosedur),
      head("V", "PENUTUP"), head("A.", "KESIMPULAN"), ...list(d.kesimpulan, "abc"),
      plainHead("DAFTAR PUSTAKA"),
      ...lines(d.pustaka).map(t => new Paragraph({ spacing: SP, indent: { left: 540, hanging: 540 }, children: runs(t) }))
    ];
    const lvl = (format, text) => ({ level: 0, format, text, alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } });
    return new Document({
      numbering: { config: [
        { reference: "abc", levels: [lvl(LevelFormat.LOWER_LETTER, "%1.")] },
        { reference: "bul", levels: [lvl(LevelFormat.BULLET, "•")] }
      ] },
      styles: { default: { document: { run: { font: CFG.font, size: CFG.size } } } },
      sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: CFG.margin } }, children: [...cover, ...bab] }]
    });
  }

  g.buildReport = build;
})(typeof window !== "undefined" ? window : globalThis);
