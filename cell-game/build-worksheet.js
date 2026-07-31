// สร้างใบงาน/ข้อสอบ เรื่อง เซลล์และการทำงานของเซลล์ (ม.4 · สสวท.)
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, PageBreak,
} = require('docx');
const fs = require('fs');

const FONT = 'TH Sarabun New';
const BODY = 32;   // 16pt (half-points)
const H1 = 40, H2 = 34;
const INK = '1a1a1a', ACC = '2b5c8a', MUT = '555555', LINE = 'b8c4d4';

// ---- helpers ----
const R = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size || BODY, bold: o.bold, italics: o.italics, color: o.color || INK });
const P = (runs, o = {}) => new Paragraph({
  children: Array.isArray(runs) ? runs : [R(runs, o)],
  spacing: { after: o.after == null ? 120 : o.after, before: o.before || 0, line: 300 },
  alignment: o.align, indent: o.indent, border: o.border,
});
const blank = () => P('', { after: 0 });

function sectionTitle(txt) {
  return new Paragraph({
    children: [R(txt, { bold: true, size: H2, color: 'ffffff' })],
    shading: { type: ShadingType.CLEAR, fill: ACC, color: 'auto' },
    spacing: { before: 260, after: 140, line: 320 },
    indent: { left: 80 },
  });
}
function instr(txt) { return P([R(txt, { italics: true, color: MUT })], { after: 100 }); }

// ---- table builders ----
const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const B = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
function cell(children, w, o = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders: B,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
    verticalAlign: 'center',
    children: (Array.isArray(children) ? children : [children]).map(c =>
      typeof c === 'string' ? P([R(c, { bold: o.bold, align: o.align })], { after: 0, align: o.align }) : c),
  });
}
function headRow(cells, widths) {
  return new TableRow({ tableHeader: true, children: cells.map((c, i) => cell(c, widths[i], { bold: true, fill: 'dce6f2', align: AlignmentType.CENTER })) });
}
function row(cells, widths, o = {}) {
  return new TableRow({ children: cells.map((c, i) => cell(c, widths[i], { align: o.aligns ? o.aligns[i] : undefined })) });
}
function table(rows, widths) {
  return new Table({ columnWidths: widths, width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, rows });
}

const W = 9020; // usable width (A4, 1" margins)

// =================================================================
const doc = new Document({
  creator: 'Cell Biology Game',
  title: 'ใบงานเซลล์และการทำงานของเซลล์',
  styles: { default: { document: { run: { font: FONT, size: BODY } } } },
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: [
      // ---------- HEADER ----------
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
        children: [R('ใบงาน / แบบทดสอบ', { bold: true, size: H1, color: ACC })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
        children: [R('เรื่อง เซลล์และการทำงานของเซลล์', { bold: true, size: H1, color: ACC })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 },
        children: [R('รายวิชาชีววิทยา ชั้นมัธยมศึกษาปีที่ 4 · ตามหลักสูตรแกนกลาง (สสวท.)', { color: MUT })] }),
      P([
        R('ชื่อ–สกุล ...........................................................  '),
        R('ชั้น ม.4/......  '), R('เลขที่ ..........  '), R('คะแนน ........../40'),
      ], { after: 60, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACC, space: 6 } } }),
      blank(),

      // ---------- ตอนที่ 1 ----------
      sectionTitle('ตอนที่ 1  จับคู่ออร์แกเนลล์กับหน้าที่  (8 คะแนน)'),
      instr('คำชี้แจง: เขียนตัวอักษร (ก–ซ) ของหน้าที่ที่ถูกต้องลงในช่องคำตอบ'),
      table([
        headRow(['ข้อ', 'ออร์แกเนลล์', 'คำตอบ'], [1000, 6020, 2000]),
        ...[
          ['1', 'นิวเคลียส (Nucleus)'],
          ['2', 'ไมโทคอนเดรีย (Mitochondria)'],
          ['3', 'คลอโรพลาสต์ (Chloroplast)'],
          ['4', 'ร่างแหเอนโดพลาซึมแบบขรุขระ (RER)'],
          ['5', 'กอลจิคอมเพล็กซ์ (Golgi complex)'],
          ['6', 'ไลโซโซม (Lysosome)'],
          ['7', 'ไรโบโซม (Ribosome)'],
          ['8', 'แวคิวโอลกลาง ในเซลล์พืช (Vacuole)'],
        ].map(r => row([r[0], r[1], ''], [1000, 6020, 2000], { aligns: [AlignmentType.CENTER, undefined, AlignmentType.CENTER] })),
      ], [1000, 6020, 2000]),
      blank(),
      P([R('ตัวเลือกหน้าที่: ', { bold: true })], { after: 40 }),
      ...[
        'ก. เปลี่ยนพลังงานในสารอาหารให้เป็น ATP (การหายใจระดับเซลล์)',
        'ข. สังเคราะห์ด้วยแสง สร้างอาหาร (น้ำตาล) จากแสง',
        'ค. ควบคุมกิจกรรมของเซลล์ และเก็บสารพันธุกรรม (DNA)',
        'ง. สังเคราะห์โปรตีน โดยมีไรโบโซมเกาะที่ผิว',
        'จ. ย่อยสลายสารและออร์แกเนลล์ที่เสื่อมสภาพด้วยเอนไซม์',
        'ฉ. ดัดแปลง คัดแยก และบรรจุสารเพื่อส่งออกจากเซลล์',
        'ช. เป็นแหล่งสังเคราะห์โปรตีน (แปลรหัสจาก mRNA)',
        'ซ. เก็บน้ำและสารละลาย รักษาความเต่งของเซลล์พืช',
      ].map(t => P([R(t)], { after: 40, indent: { left: 200 } })),
      blank(),

      // ---------- ตอนที่ 2 ----------
      sectionTitle('ตอนที่ 2  จำแนกเซลล์  (12 คะแนน)'),
      P([R('2.1 ', { bold: true }), R('ทำเครื่องหมาย ✓ ในช่องที่พบโครงสร้างต่อไปนี้  (7 คะแนน)', { bold: true })], { after: 80 }),
      table([
        headRow(['โครงสร้าง / ลักษณะ', 'เซลล์พืช', 'เซลล์สัตว์', 'ทั้งสองชนิด'], [4220, 1600, 1600, 1600]),
        ...[
          'ผนังเซลล์ (เซลลูโลส)', 'คลอโรพลาสต์', 'แวคิวโอลกลางขนาดใหญ่',
          'เซนทริโอลที่เห็นชัดเจน', 'ไลโซโซมจำนวนมาก', 'ไมโทคอนเดรีย', 'นิวเคลียส',
        ].map(t => row([t, '', '', ''], [4220, 1600, 1600, 1600])),
      ], [4220, 1600, 1600, 1600]),
      blank(),
      P([R('2.2 ', { bold: true }), R('เติม “โพร” (โพรคาริโอต) / “ยู” (ยูคาริโอต) / “ทั้งสอง” ลงในช่องว่าง  (5 คะแนน)', { bold: true })], { after: 80 }),
      ...[
        'มีเยื่อหุ้มนิวเคลียส (นิวเคลียสแท้)',
        'DNA อยู่บริเวณนิวคลีออยด์ ไม่มีเยื่อหุ้มนิวเคลียส',
        'มีออร์แกเนลล์ที่มีเยื่อหุ้ม เช่น ไมโทคอนเดรีย',
        'มีไรโบโซมเพื่อสังเคราะห์โปรตีน',
        'ตัวอย่างเซลล์ชนิดนี้คือ แบคทีเรีย',
      ].map((t, i) => P([R(`${i + 1}) ${t}  `), R('...................')], { after: 60, indent: { left: 200 } })),
      blank(),

      // ---------- ตอนที่ 3 ----------
      sectionTitle('ตอนที่ 3  การลำเลียงสารผ่านเซลล์  (8 คะแนน)'),
      P([R('3.1 ', { bold: true }), R('เติมชื่อกระบวนการลำเลียงสารให้ถูกต้อง  (5 คะแนน)', { bold: true })], { after: 80 }),
      ...[
        'การเคลื่อนที่ของสารจากบริเวณเข้มข้นสูงไปต่ำ โดยไม่ใช้พลังงาน',
        'การแพร่ของน้ำผ่านเยื่อเลือกผ่าน',
        'การลำเลียงสารทวนความเข้มข้น (ต่ำ→สูง) โดยใช้พลังงาน ATP',
        'การนำสารขนาดใหญ่เข้าสู่เซลล์โดยใช้ถุงเยื่อหุ้ม',
        'การปล่อยสารออกนอกเซลล์โดยถุงรวมกับเยื่อหุ้มเซลล์',
      ].map((t, i) => P([R(`${i + 1}) ${t}`)], { after: 20, indent: { left: 200 } })
      ).flatMap((p, i) => [p, P([R('   ตอบ: ...............................................')], { after: 60, indent: { left: 200 }, color: MUT })]),
      P([R('3.2 ', { bold: true }), R('เติมผลที่เกิดขึ้นกับเซลล์  (3 คะแนน)', { bold: true })], { after: 80 }),
      ...[
        'นำเซลล์เม็ดเลือดแดงใส่ในน้ำกลั่น (สารละลายไฮโปทอนิก) → ..............................................',
        'แช่เซลล์พืชในสารละลายไฮเปอร์ทอนิก → ..............................................',
        'เซลล์อยู่ในสารละลายไอโซทอนิก → ..............................................',
      ].map((t, i) => P([R(`${i + 1}) ${t}`)], { after: 60, indent: { left: 200 } })),
      blank(),

      // ---------- ตอนที่ 4 ----------
      sectionTitle('ตอนที่ 4  การแบ่งเซลล์แบบไมโทซิส  (6 คะแนน)'),
      P([R('4.1 ', { bold: true }), R('เขียนหมายเลข 1–6 เรียงลำดับระยะการแบ่งเซลล์ให้ถูกต้อง (จากระยะแรกไประยะสุดท้าย)', { bold: true })], { after: 80 }),
      ...[
        'โพรเฟส (Prophase)', 'เทโลเฟส (Telophase)', 'อินเตอร์เฟส (Interphase)',
        'เมทาเฟส (Metaphase)', 'ไซโทไคเนซิส (Cytokinesis)', 'แอนาเฟส (Anaphase)',
      ].map(t => P([R('(...........)  '), R(t)], { after: 50, indent: { left: 200 } })),
      blank(),

      // ---------- ตอนที่ 5 ----------
      sectionTitle('ตอนที่ 5  เลือกคำตอบที่ถูกต้อง  (6 คะแนน)'),
      ...mcqParagraphs(),

      // จบข้อสอบ
      blank(),
      P([R('— หมดข้อสอบ · รวม 40 คะแนน —', { italics: true, color: MUT })], { align: AlignmentType.CENTER }),

      // ---------- เฉลย (หน้าใหม่) ----------
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 },
        children: [R('เฉลยและคำอธิบาย', { bold: true, size: H1, color: ACC })] }),
      instr('สำหรับครูผู้สอน — เฉลยพร้อมคำอธิบายและจุดที่นักเรียนมักเข้าใจผิด'),

      P([R('ตอนที่ 1 จับคู่ออร์แกเนลล์: ', { bold: true }), R('1-ค, 2-ก, 3-ข, 4-ง, 5-ฉ, 6-จ, 7-ช, 8-ซ')], { after: 60 }),
      P([R('หมายเหตุ: ', { bold: true, color: ACC }), R('ไมโทคอนเดรีย “เปลี่ยนรูปพลังงาน” ในสารอาหารเป็น ATP ไม่ใช่สร้างพลังงานขึ้นใหม่ และพบทั้งเซลล์พืชและสัตว์')], { after: 120, indent: { left: 200 } }),

      P([R('ตอนที่ 2.1 จำแนกพืช/สัตว์: ', { bold: true })], { after: 40 }),
      ...[
        'ผนังเซลล์ (เซลลูโลส) → เซลล์พืช',
        'คลอโรพลาสต์ → เซลล์พืช',
        'แวคิวโอลกลางขนาดใหญ่ → เซลล์พืช',
        'เซนทริโอลที่เห็นชัดเจน → เซลล์สัตว์ (พืชดอกส่วนใหญ่ไม่มี)',
        'ไลโซโซมจำนวนมาก → เซลล์สัตว์',
        'ไมโทคอนเดรีย → ทั้งสองชนิด (พืชก็ต้องหายใจระดับเซลล์)',
        'นิวเคลียส → ทั้งสองชนิด',
      ].map(t => P([R('• ' + t)], { after: 20, indent: { left: 260 } })),
      P([R('ตอนที่ 2.2 โพร/ยู: ', { bold: true }), R('1) ยู   2) โพร   3) ยู   4) ทั้งสอง   5) โพร')], { after: 60 }),
      P([R('หมายเหตุ: ', { bold: true, color: ACC }), R('โพรคาริโอตมี DNA และไรโบโซม (70S) เพียงแต่ไม่มีเยื่อหุ้มนิวเคลียสและออร์แกเนลล์ที่มีเยื่อหุ้ม')], { after: 120, indent: { left: 200 } }),

      P([R('ตอนที่ 3.1 การลำเลียงสาร: ', { bold: true })], { after: 40 }),
      ...[
        '1) การแพร่ (Diffusion) — ไม่ใช้พลังงาน',
        '2) ออสโมซิส (Osmosis) — การแพร่ของ “น้ำ” ผ่านเยื่อเลือกผ่าน',
        '3) แอกทีฟทรานสปอร์ต (Active transport) — ใช้ ATP',
        '4) เอนโดไซโทซิส (Endocytosis)',
        '5) เอกโซไซโทซิส (Exocytosis)',
      ].map(t => P([R('• ' + t)], { after: 20, indent: { left: 260 } })),
      P([R('ตอนที่ 3.2 Tonicity: ', { bold: true })], { after: 40 }),
      ...[
        '1) ไฮโปทอนิก → น้ำเข้าเซลล์ เซลล์บวมและอาจแตก (haemolysis)',
        '2) พืชในไฮเปอร์ทอนิก → น้ำออก เกิดพลาสโมไลซิส (เยื่อหุ้มหดแยกจากผนังเซลล์)',
        '3) ไอโซทอนิก → น้ำเข้าออกเท่ากัน เซลล์รูปร่างปกติ',
      ].map(t => P([R('• ' + t)], { after: 20, indent: { left: 260 } })),
      P([R('หมายเหตุ: ', { bold: true, color: ACC }), R('เซลล์พืชในน้ำจืดไม่แตกเพราะมีผนังเซลล์ต้านแรงดัน (เต่ง/turgid) ต่างจากเซลล์สัตว์')], { after: 120, indent: { left: 200 } }),

      P([R('ตอนที่ 4 เรียงลำดับไมโทซิส: ', { bold: true })], { after: 40 }),
      P([R('อินเตอร์เฟส (1) → โพรเฟส (2) → เมทาเฟส (3) → แอนาเฟส (4) → เทโลเฟส (5) → ไซโทไคเนซิส (6)')], { after: 40, indent: { left: 200 } }),
      P([R('เรียงตามตัวเลือก: ', { bold: true }), R('โพรเฟส=2, เทโลเฟส=5, อินเตอร์เฟส=1, เมทาเฟส=3, ไซโทไคเนซิส=6, แอนาเฟส=4')], { after: 60, indent: { left: 200 } }),
      P([R('หมายเหตุ: ', { bold: true, color: ACC }), R('DNA จำลองตัวในระยะ S ของอินเตอร์เฟส (ไม่ใช่โพรเฟส) และในแอนาเฟส “โครมาทิดพี่น้อง” แยกจากกัน')], { after: 120, indent: { left: 200 } }),

      P([R('ตอนที่ 5 เลือกตอบ: ', { bold: true }), R(mcqAnswerLine())], { after: 60 }),
    ],
  }],
});

// ---- MCQ data (ตอนที่ 5) ----
function mcqData() {
  return [
    { q: 'ออร์แกเนลล์ใดพบเฉพาะในเซลล์พืชและสาหร่าย', opts: ['ไมโทคอนเดรีย', 'คลอโรพลาสต์', 'ไรโบโซม', 'กอลจิคอมเพล็กซ์'], ans: 1 },
    { q: 'DNA จำลองตัว (replication) ในระยะใดของวัฏจักรเซลล์', opts: ['ระยะ S ของอินเตอร์เฟส', 'โพรเฟส', 'เมทาเฟส', 'แอนาเฟส'], ans: 0 },
    { q: 'ข้อใดเป็นการลำเลียงแบบ “ใช้พลังงาน”', opts: ['การแพร่ของออกซิเจน', 'ออสโมซิสของน้ำ', 'โซเดียม-โพแทสเซียมปั๊ม', 'การแพร่แบบฟาซิลิเทต'], ans: 2 },
    { q: 'ผลของการแบ่งเซลล์แบบไมโทซิส 1 ครั้ง คือข้อใด', opts: ['เซลล์ลูก 4 เซลล์ ลดโครโมโซมครึ่ง', 'เซลล์ลูก 2 เซลล์ เหมือนเซลล์แม่', 'เซลล์ลูก 2 เซลล์ ต่างจากแม่', 'เซลล์ลูก 4 เซลล์ เหมือนกัน'], ans: 1 },
    { q: 'ลักษณะใดเป็นของเซลล์โพรคาริโอต', opts: ['มีนิวเคลียสแท้', 'ไม่มีเยื่อหุ้มนิวเคลียส', 'มีไมโทคอนเดรีย', 'มีไรโบโซม 80S'], ans: 1 },
    { q: 'เซลล์พืชแช่ในสารละลายไฮเปอร์ทอนิกจะเกิดปรากฏการณ์ใด', opts: ['เต่ง (turgid)', 'พลาสโมไลซิส', 'เซลล์แตก', 'ไม่เปลี่ยนแปลง'], ans: 1 },
  ];
}
function mcqParagraphs() {
  const thai = ['ก', 'ข', 'ค', 'ง'];
  const out = [];
  mcqData().forEach((it, i) => {
    out.push(P([R(`${i + 1}. ${it.q}`, { bold: true })], { after: 30, indent: { left: 100 } }));
    it.opts.forEach((o, j) => out.push(P([R(`${thai[j]}. ${o}`)], { after: 20, indent: { left: 500 } })));
  });
  return out;
}
function mcqAnswerLine() {
  const thai = ['ก', 'ข', 'ค', 'ง'];
  return mcqData().map((it, i) => `${i + 1}-${thai[it.ans]}`).join(', ');
}

Packer.toBuffer(doc).then(b => { fs.writeFileSync('cell-worksheet.docx', b); console.log('✓ wrote cell-worksheet.docx', (b.length / 1024).toFixed(1), 'KB'); });
