(function (g) {
  const D = g.docx;

  const {
    Document,
    Paragraph,
    TextRun,
    AlignmentType,
    ImageRun,
    MathRun,
    MathFraction,
    MathSubScript,
    MathSuperScript,
    MathSubSuperScript,
    MathSum,
    LevelFormat,
    TabStopType,
    LineRuleType,
    Tab
  } = D;

  const MathX = D.Math;

  // =====================================================
  // KONFIGURASI FORMAT DOKUMEN (Ngikut Laprak RL yang ketik manual)
  // =====================================================

  const CFG = {
    font: "Times New Roman",
    size: 24,                  // 12 pt
    line: 276,                 // spasi 1,15 (bawaan Word)
    indent: 720,               // baris pertama alinea: menjorok 1,27 cm
    bodyLeft: 720,             // seluruh alinea digeser 1,27 cm dari margin
    rightIndent: 30,
    logoWidth: 162,            // sekitar 1,69 inci 

    bodyColor: "0070C0",
    headingColor: "0070C0",
    coverColor: "000000",

    margin: {
      top: 1701,
      right: 1701,
      bottom: 1701,
      left: 2268
    },

    page: {
      width: 11910,
      height: 16840
    }
  };

  // Spasi antarparagraf: baris 1,15, jarak sebelum/sesudah diatur per elemen.
  function sp(before, after) {
    return {
      line: CFG.line,
      lineRule: LineRuleType.AUTO,
      before,
      after
    };
  }

  const SP = sp(0, 200);       // bawaan dokumen contoh: sesudah 10 pt

  const COVER_SP = {
    line: 300,
    lineRule: LineRuleType.AUTO,
    after: 100
  };

  // =====================================================
  // LATEX -> WORD EQUATION
  // =====================================================

  const GREEK = {
    alpha: "α",
    beta: "β",
    gamma: "γ",
    delta: "δ",
    Delta: "Δ",
    theta: "θ",
    lambda: "λ",
    mu: "μ",
    pi: "π",
    sigma: "σ",
    omega: "ω",
    Omega: "Ω",
    phi: "φ",
    tau: "τ",
    epsilon: "ε",

    cdot: "⋅",
    times: "×",
    pm: "±",
    approx: "≈",
    neq: "≠",
    leq: "≤",
    geq: "≥",
    lvert: "|",
    rvert: "|",
    infty: "∞",
    rightarrow: "→",
    div: "÷",
    degree: "°"
  };

  function texToMath(src) {
    let i = 0;

    const ws = () => {
      while (src[i] === " ") i++;
    };

    const group = () => {
      i++;
      const result = seq("}");
      if (src[i] === "}") i++;
      return result;
    };

    const arg = () => {
      ws();
      return src[i] === "{" ? group() : atom();
    };

    function atom() {
      ws();

      const c = src[i];

      if (c === "{") return group();

      if (c === "\\") {
        i++;

        const match = /^[a-zA-Z]+/.exec(src.slice(i));

        if (!match) {
          return [new MathRun(src[i++] || "")];
        }

        const cmd = match[0];
        i += cmd.length;

        if (cmd === "frac") {
          const numerator = arg();
          const denominator = arg();

          return [
            new MathFraction({
              numerator,
              denominator
            })
          ];
        }

        if (cmd === "text" || cmd === "mathrm") {
          ws();

          let value = "";

          if (src[i] === "{") {
            i++;

            while (i < src.length && src[i] !== "}") {
              value += src[i++];
            }

            i++;
          }

          return [new MathRun(value)];
        }

        if (cmd === "sum") {
          let sub;
          let sup;

          ws();

          while (src[i] === "_" || src[i] === "^") {
            const key = src[i++];
            const value = arg();

            if (key === "_") sub = value;
            else sup = value;

            ws();
          }

          const children =
            i < src.length && src[i] !== "}"
              ? atom()
              : [];

          return [
            new MathSum({
              children,
              subScript: sub,
              superScript: sup
            })
          ];
        }

        return [
          new MathRun(GREEK[cmd] || "\\" + cmd)
        ];
      }

      i++;

      return [new MathRun(c)];
    }

    function seq(end) {
      const result = [];

      while (i < src.length) {
        ws();

        if (i >= src.length || src[i] === end) break;

        let base = atom();
        let sub;
        let sup;

        for (;;) {
          ws();

          if (src[i] === "_") {
            i++;
            sub = arg();
          } else if (src[i] === "^") {
            i++;
            sup = arg();
          } else {
            break;
          }
        }

        if (sub && sup) {
          base = [
            new MathSubSuperScript({
              children: base,
              subScript: sub,
              superScript: sup
            })
          ];
        } else if (sub) {
          base = [
            new MathSubScript({
              children: base,
              subScript: sub
            })
          ];
        } else if (sup) {
          base = [
            new MathSuperScript({
              children: base,
              superScript: sup
            })
          ];
        }

        result.push(...base);
      }

      return result;
    }

    return new MathX({
      children: seq(null)
    });
  }

  // =====================================================
  // TEXT RUN
  // =====================================================

  function tr(text, options = {}, color = CFG.bodyColor) {
    return new TextRun({
      text,
      font: CFG.font,
      size: CFG.size,
      color,
      ...options
    });
  }

  function runs(text, extra = {}, color = CFG.bodyColor) {
    const result = [];

    const parts = text.split(
      /(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*)/
    );

    parts.forEach(part => {
      if (!part) return;

      if (part[0] === "$" && part.length > 2) {
        result.push(texToMath(part.slice(1, -1)));
      }

      else if (part.startsWith("**") && part.length > 4) {
        result.push(
          tr(
            part.slice(2, -2),
            { ...extra, bold: true },
            color
          )
        );
      }

      else if (part[0] === "*" && part.length > 2) {
        result.push(
          tr(
            part.slice(1, -1),
            { ...extra, italics: true },
            color
          )
        );
      }

      else {
        result.push(tr(part, extra, color));
      }
    });

    return result;
  }
  // =====================================================
  // PEMROSESAN TEKS
  // =====================================================

  function normalize(text) {
    return (text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
  }

  // Satu baris = satu elemen. Baris kosong diabaikan.
  function lines(text) {
    return normalize(text)
      .split("\n")
      .map(x => x.trim())
      .filter(Boolean);
  }

  // =====================================================
  // PARAGRAF BIASA
  // Rata kiri-kanan. Baris lanjutan mulai di 1,27 cm (sejajar teks judul),
  // baris pertama menjorok 1,27 cm lagi. Sebelum 6 pt, sesudah 0.
  // =====================================================

  function paragraph(text, options = {}) {
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,

      spacing: sp(120, 0),

      indent: {
        left: CFG.bodyLeft,
        firstLine: CFG.indent,
        right: CFG.rightIndent,
        ...options.indent
      },

      children: runs(text)
    });
  }

  // =====================================================
  // HEADING BAB: I, II, III ...
  // Angka di 0,63 cm, judul di 1,27 cm (hanging indent)
  // =====================================================

  function headingRoman(number, title, pageBreak = false) {
    return new Paragraph({
      alignment: AlignmentType.LEFT,

      spacing: sp(pageBreak ? 0 : 240, 0),

      keepNext: true,
      pageBreakBefore: pageBreak,

      indent: {
        left: 720,
        hanging: 360,
        right: CFG.rightIndent
      },

      children: [
        new TextRun({
          children: [number, new Tab(), title],
          font: CFG.font,
          size: CFG.size,
          bold: true,
          color: CFG.headingColor
        })
      ]
    });
  }

  // =====================================================
  // SUBJUDUL
  //   level 0 -> A. B. C.   (kiri 720, hanging 360)
  //   level 1 -> a. b. c.   (kiri 1080, hanging 360)
  //   level 2 -> 1) 2) 3)   (kiri 1080, hanging 360)
  // =====================================================

  const HEAD_LEVEL = {
    0: { left: 720, hanging: 360, before: 240 },
    1: { left: 1080, hanging: 360, before: 120 },
    2: { left: 1080, hanging: 360, before: 120 }
  };

  function labeledHeading(label, title, level = 0) {
    const h = HEAD_LEVEL[level] || HEAD_LEVEL[1];

    return new Paragraph({
      alignment: AlignmentType.LEFT,

      spacing: sp(h.before, 0),

      keepNext: true,

      indent: {
        left: h.left,
        hanging: h.hanging,
        right: CFG.rightIndent
      },

      children: [
        new TextRun({
          children: [label, new Tab(), title],
          font: CFG.font,
          size: CFG.size,
          bold: true,
          color: CFG.headingColor
        })
      ]
    });
  }

  // =====================================================
  // BUTIR DAFTAR (label + tab + isi, hanging indent)
  // =====================================================

  function listParagraph(label, text, opt = {}) {
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,

      spacing: sp(opt.before ?? 0, 0),

      indent: {
        left: opt.left ?? 720,
        hanging: opt.hanging ?? 360,
        right: CFG.rightIndent
      },

      children: [
        tr(label, {}, CFG.bodyColor),
        new TextRun({
          children: [new Tab()],
          font: CFG.font,
          size: CFG.size,
          color: CFG.bodyColor
        }),
        ...runs(text)
      ]
    });
  }

  // Buang penanda yang sudah diketik pengguna: "a. ", "b) ", "1. ", "2) ", "- "
  function stripMarker(line) {
    return line
      .replace(/^[-•]\s+/, "")
      .replace(/^([a-z]|\d+)[.)]\s+/i, "");
  }

  // Satu baris = satu butir, diberi huruf (a. b. c.) atau angka (1. 2. 3.)
  function itemize(text, kind, opt = {}) {
    const letters = "abcdefghijklmnopqrstuvwxyz";

    return lines(text).map((line, i) => {
      const label =
        kind === "letters"
          ? letters[i % letters.length] + "."
          : (i + 1) + ".";

      return listParagraph(label, stripMarker(line), opt);
    });
  }

  // =====================================================
  // BODY: dasar teori, latar belakang, prosedur
  // Satu baris = satu elemen.
  //   ## Judul     -> subjudul a. b. c.
  //   ### Judul    -> subjudul 1) 2) 3)
  //   - teks       -> butir bullet
  //   1. / 1)      -> butir angka
  //   a. / a)      -> butir huruf
  //   $rumus$      -> rumus di tengah (jika sebaris sendiri)
  //   Gambar/Tabel -> keterangan di tengah, miring
  // =====================================================

  function body(text, opt = {}) {
    const result = [];

    const numLeft = opt.numLeft ?? 720;

    let letterIndex = 0;
    let numberIndex = 0;

    const letters = "abcdefghijklmnopqrstuvwxyz";

    lines(text).forEach(line => {

      // SUBJUDUL: a. b. c.

      if (line.startsWith("### ")) {
        numberIndex++;

        result.push(
          labeledHeading(
            numberIndex + ")",
            line.slice(4).trim(),
            2
          )
        );

        return;
      }

      if (line.startsWith("## ")) {
        const label =
          letters[letterIndex % letters.length] + ".";

        letterIndex++;
        numberIndex = 0;

        result.push(
          labeledHeading(label, line.slice(3).trim(), 1)
        );

        return;
      }

      // BULLET

      if (line.startsWith("- ")) {
        result.push(
          listParagraph("•", line.slice(2), {
            left: 720,
            hanging: 360
          })
        );

        return;
      }

      // BUTIR ANGKA: 1. atau 1)

      const numbered = /^(\d+[.)])\s+(.+)$/.exec(line);

      if (numbered) {
        result.push(
          listParagraph(numbered[1], numbered[2], {
            left: numLeft,
            hanging: 360
          })
        );

        return;
      }

      // BUTIR HURUF: a. atau a)

      const alphabetic = /^([a-z][.)])\s+(.+)$/.exec(line);

      if (alphabetic) {
        result.push(
          listParagraph(alphabetic[1], alphabetic[2], {
            left: 1080,
            hanging: 360
          })
        );

        return;
      }

      // RUMUS SEBARIS SENDIRI

      if (/^\$[^$]+\$$/.test(line)) {
        result.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: sp(120, 120),
            children: runs(line)
          })
        );

        return;
      }

      // KETERANGAN GAMBAR / TABEL

      if (/^(Gambar|Tabel)\s+/i.test(line)) {
        result.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: sp(0, 200),
            children: runs(line, { italics: true })
          })
        );

        return;
      }

      // PARAGRAF BIASA

      result.push(paragraph(line));
    });

    return result;
  }

  // =====================================================
  // DAFTAR PUSTAKA
  // Satu baris = satu pustaka, rata kiri, menjorok 0,95 cm
  // =====================================================

  function bibliography(text) {
    return lines(text).map(line =>
      new Paragraph({
        alignment: AlignmentType.LEFT,

        spacing: sp(0, 200),

        indent: {
          left: 540
        },

        children: runs(line)
      })
    );
  }

  // =====================================================
  // COVER
  // =====================================================

  function coverParagraph(text, options = {}) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,

      spacing: {
        ...COVER_SP,
        ...options.spacing
      },

      keepLines: true,

      children: [
        tr(
          text,
          options.run || {},
          CFG.coverColor
        )
      ]
    });
  }

  function logoParagraph(logo) {
    if (!logo) {
      return new Paragraph({
        spacing: {
          before: 3800,
          after: 100
        },
        children: []
      });
    }

    return new Paragraph({
      alignment: AlignmentType.CENTER,

      spacing: {
        before: 1200,
        after: 1200
      },

      children: [
        new ImageRun({
          type: logo.type,
          data: logo.data,

          transformation: {
            width: CFG.logoWidth,
            height: Math.round(
              CFG.logoWidth * logo.ratio
            )
          }
        })
      ]
    });
  }

  function createCover(d) {
    const oneLine = {
      line: 240,
      lineRule: LineRuleType.AUTO,
      after: 100
    };

    return [
      coverParagraph(
        "LAPORAN PRAKTIKUM MODUL " + (d.modul || ""),
        {
          run: { bold: true },
          spacing: {
            before: 0,
            after: 180
          }
        }
      ),

      coverParagraph(
        (d.judul || "").toUpperCase(),
        {
          run: { bold: true },
          spacing: {
            after: 900
          }
        }
      ),

      coverParagraph(
        "Disusun untuk Memenuhi Mata Kuliah " + (d.matkul || "")
      ),

      coverParagraph(
        "Dibimbing oleh " + (d.dosen || ""),
        {
          spacing: {
            after: 900
          }
        }
      ),

      coverParagraph("Disusun Oleh:", {
        spacing: {
          after: 900
        }
      }),

      coverParagraph(
        (d.nama || "").toUpperCase(),
        {
          spacing: {
            after: 100
          }
        }
      ),

      coverParagraph("NIM. " + (d.nim || "")),

      coverParagraph(d.kelas || "", {
        spacing: {
          after: 500
        }
      }),

      logoParagraph(d.logo),

      ...lines(d.institusi).map(text =>
        coverParagraph(text, {
          run: { bold: true },
          spacing: oneLine
        })
      ),

      coverParagraph(
        (d.waktu || "").toUpperCase(),
        {
          run: { bold: true },
          spacing: oneLine
        }
      )
    ];
  }

  // =====================================================
  // PEMBENTUKAN LAPORAN
  // =====================================================

  function build(d) {
    const cover = createCover(d);

    const content = [

      // I. PENDAHULUAN

      headingRoman("I", "PENDAHULUAN", true),

      labeledHeading("A.", "LATAR BELAKANG", 0),
      ...body(d.latar),

      labeledHeading("B.", "TUJUAN PRAKTIKUM", 0),
      ...itemize(d.tujuan, "letters", { left: 1080 }),

      labeledHeading("C.", "DASAR TEORI", 0),
      ...body(d.teori),

      // II. ALAT DAN BAHAN

      headingRoman("II", "ALAT DAN BAHAN"),

      paragraph(
        "Alat dan komponen yang digunakan dalam praktikum adalah sebagai berikut:",
        { indent: { left: 360, firstLine: 0 } }
      ),

      ...itemize(d.alat, "letters", { left: 720 }),

      // III. PROSEDUR PERCOBAAN

      headingRoman("III", "PROSEDUR PERCOBAAN"),

      ...body(d.prosedur, { numLeft: 1350 }),

      // V. PENUTUP
      // (Bab IV, hasil dan pembahasan, diisi manual di Word)

      headingRoman("V", "PENUTUP", true),

      labeledHeading("A.", "Kesimpulan", 0),

      ...itemize(d.kesimpulan, "numbers", {
        left: 1080,
        hanging: 270,
        before: 120
      }),

      // VI. DAFTAR PUSTAKA

      headingRoman("VI", "DAFTAR PUSTAKA", true),

      ...bibliography(d.pustaka)
    ];

    return new Document({
      styles: {
        default: {
          document: {
            run: {
              font: CFG.font,
              size: CFG.size,
              color: CFG.bodyColor
            },

            paragraph: {
              spacing: SP
            }
          }
        }
      },

      sections: [
        {
          properties: {
            page: {
              size: CFG.page,
              margin: CFG.margin
            }
          },

          children: [
            ...cover,
            ...content
          ]
        }
      ]
    });
  }

  // =====================================================
  // EXPORT FUNCTION
  // =====================================================

  g.buildReport = build;

  console.log(
    "Generator laporan versi revisi berhasil dimuat."
  );

})(typeof window !== "undefined" ? window : globalThis);
