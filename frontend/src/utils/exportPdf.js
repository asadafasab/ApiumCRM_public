import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import roboto from "../Roboto-Light.ttf";

class ExportFile {
  // TODO truncate text
  fontSize = 8;
  padding = 4;
  columnPadding = 10;
  rowCount = 17;
  maxTextWidth = 72;
  maxTextLength = 60;
  lineThickness = 1;
  color = rgb(0.5, 0.5, 0.5);
  rowHeight = 50;
  colSizes = [110, 165, 220, 255, 340, 460, 500, 555, 600];
  colNames = [
    "Nazwa firmy",
    "NIP",
    "Tel",
    "Medium",
    "Adres",
    "Handlowcy",
    "Cena",
    "Koniec umowy",
    "Wolumen",
  ];

  drawOneColumn = (font, page, title, x1, lastX = 0) => {
    const { width, height } = page.getSize();

    page.drawLine({
      start: { x: x1, y: 0 },
      end: { x: x1, y: height },
      thickness: this.lineThickness,
      color: this.color,
      opacity: 1.0,
    });
    page.drawText(title, {
      x: x1 - lastX + this.padding,
      y: height - this.columnPadding,
      size: this.fontSize,
      font: font,
      maxWidth: this.maxTextWidth,
    });
  };
  drawRowLine = (page, y1) => {
    const { width, height } = page.getSize();
    page.drawLine({
      start: { x: 0, y: y1 },
      end: { x: width, y: y1 },
      thickness: this.lineThickness,
      color: this.color,
      opacity: 1.0,
    });
  };

  onePageTable = (page, font) => {
    const { width, height } = page.getSize();
    // columns
    for (let i = 0; i < this.colSizes.length; i++) {
      let last = this.colSizes[i];
      if (i != 0) {
        last = this.colSizes[i] - this.colSizes[i - 1];
      }
      this.drawOneColumn(font, page, this.colNames[i], this.colSizes[i], last);
    }

    // rows
    for (let i = 0; i < this.rowCount; i++) {
      this.drawRowLine(page, i * this.rowHeight);
    }
  };
  drawOneCellData = (font, page, y, x, text) => {
    if (!isNaN(text)) {
      text = `${text}`;
    }
    page.drawText(text, {
      x: x,
      y: y,
      size: this.fontSize,
      font: font,
      maxWidth: this.maxTextWidth,
      lineHeight: this.fontSize,
    });
  };
  drawData = (font, page, row, data) => {
    const { width, height } = page.getSize();

    let y1 = height - row * this.rowHeight;
    this.drawOneCellData(
      font,
      page,
      y1,
      this.padding,
      data.name.substring(0, Math.min(this.maxTextLength, data.name.length))
    );
    this.drawOneCellData(
      font,
      page,
      y1,
      this.padding + this.colSizes[0],
      data.nip
    );
    this.drawOneCellData(
      font,
      page,
      y1,
      this.padding + this.colSizes[1],
      data.phone_number
    );
    this.drawOneCellData(
      font,
      page,
      y1,
      this.padding + this.colSizes[2],
      data.medium
    );
    this.drawOneCellData(
      font,
      page,
      y1,
      this.padding + this.colSizes[3],
      data.address
    );
    this.drawOneCellData(
      font,
      page,
      y1,
      this.padding + this.colSizes[4],
      data.salesman
    );
    this.drawOneCellData(
      font,
      page,
      y1,
      this.padding + this.colSizes[5],
      data.price
    );
    this.drawOneCellData(
      font,
      page,
      y1,
      this.padding + this.colSizes[6],
      data.date_end
    );
    this.drawOneCellData(
      font,
      page,
      y1,
      this.padding + this.colSizes[7],
      data.volume
    );
  };
  generate = async (data) => {
    const fontBytes = await fetch(roboto).then((res) => res.arrayBuffer());
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const robotoFont = await doc.embedFont(fontBytes);

    let page = doc.addPage();
    const { width, height } = page.getSize();

    let row = 1;
    console.log(data);
    this.onePageTable(page, robotoFont);

    data.forEach((element) => {
      if (row > this.rowCount) {
        row = 1;
        page = doc.addPage();
        this.onePageTable(page, robotoFont);
      }
      this.drawData(robotoFont, page, row, element);
      row += 1;
    });

    const docBytes = await doc.save();
    const blob = new Blob([docBytes]);
    const fileName = `eksport_${new Date().toISOString()}.pdf`;
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
}
export default ExportFile;
