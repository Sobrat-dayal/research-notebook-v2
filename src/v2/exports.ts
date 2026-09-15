import { download } from "./api";
import type { Notebook } from "./types";
export function exportFilename(title:string,extension:string){return (title.replace(/[<>:"/\\|?*\x00-\x1f]/g, "").trim().slice(0,80)||"Research notebook")+"."+extension;}
export async function buildWord(n: Notebook, includeChat = true) {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } =
    await import("docx");
  const children: any[] = [
    new Paragraph({ text: n.title, heading: HeadingLevel.TITLE }),
    new Paragraph("Research notebook export"),
  ];
  const cite = (e: {sourceId:string;quote:string;page?:number}) => {const source=n.sources.find(s=>s.id===e.sourceId);return `Evidence: ${source?.title||e.sourceId}${e.page ? " (page "+e.page+")" : ""}\n${e.quote}`;};
  const add = (title: string, text: string) => {
    children.push(
      new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
    );
    for (const line of text.split("\n").filter(line=>line.trim()))
      children.push(new Paragraph({ children: [new TextRun(line)] }));
  };
  if (n.summary) {
    add("Overview", n.summary.overview);
    for (const key of [
      "contributions",
      "methodology",
      "results",
      "limitations",
      "implications",
    ] as const) {
      add(
        key[0].toUpperCase() + key.slice(1),
        n.summary[key]
          .map(
            (f) =>
              `${f.title}\n${f.text}${f.evidence ? "\n" + cite(f.evidence) : ""}`,
          )
          .join("\n\n"),
      );
    }
    add(
      "References",
      n.summary.references
        .map(
          (r) =>
            `${r.title}${r.authors ? " — " + r.authors : ""}${r.url ? "\n" + r.url : ""}`,
        )
        .join("\n"),
    );
  }
  for(const [title,text] of Object.entries(n.tools||{})){add(title,text);for(const e of n.toolEvidence?.[title]||[])add("Supporting excerpt",cite(e));}
  if(n.summary?.glossary.length)add("Glossary",n.summary.glossary.map(x=>`${x.term}: ${x.definition}`).join("\n"));
  if(n.summary?.metrics.length)add("Reported measurements",n.summary.metrics.map(x=>`${x.label}: ${x.value} ${x.unit}\n${cite(x)}`).join("\n\n"));
  add(
    "Sources",
    n.sources
      .map((s) => `${s.title}\n${s.authors||""}\n${s.coverage}\n${s.url || ""}`)
      .join("\n\n"),
  );
  if (n.notes.length)
    add("Saved notes", n.notes.map((x) => x.text).join("\n\n"));
  if (includeChat && n.messages.length)
    add(
      "Discussion",
      n.messages
        .map(
          (m) =>
            `${m.role === "user" ? "You" : "Research assistant"}\n${m.text}${m.evidence?.length ? "\n"+m.evidence.map(cite).join("\n") : ""}`,
        )
        .join("\n\n"),
    );
  return Packer.toBlob(new Document({
    styles:{paragraphStyles:[{id:"Title",name:"Title",run:{color:"000000",font:"Calibri",size:40},paragraph:{spacing:{after:240}}},{id:"Heading1",name:"Heading 1",run:{color:"000000",font:"Calibri",size:28,bold:true},paragraph:{keepNext:true,spacing:{before:240,after:120}}}],default:{document:{run:{font:"Calibri",size:22,color:"000000"},paragraph:{spacing:{after:140,line:280}}}}},
    sections: [{ children }]
  }));
}
export async function exportWord(n:Notebook,includeChat=true){download(await buildWord(n,includeChat),exportFilename(n.title,"docx"));}
export async function buildPowerPoint(n: Notebook) {
  if (!n.deck?.slides.length) throw new Error("Generate a presentation first.");
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = n.deck.title;
  pptx.subject = "Research presentation";
  pptx.author = "Research Notebook";
  const colors =
    n.deck.theme === "midnight"
      ? { bg: "111827", fg: "F8FAFC", accent: "7DD3FC" }
      : n.deck.theme === "botanical"
        ? { bg: "F3F8F1", fg: "153A2C", accent: "218562" }
        : { bg: "FAF8F5", fg: "24252B", accent: "5B4EE6" };
  for (const [i, s] of n.deck.slides.entries()) {
    const slide = pptx.addSlide();
    slide.background = { color: colors.bg };
    slide.addText(s.title, {
      x: 0.65,
      y: 0.5,
      w: 12,
      h: 1.05,
      fontSize: 29,
      bold: true,
      color: colors.fg,
      breakLine: false,
      fit: "shrink",
    });
    slide.addText(
      s.bullets.map((text) => ({
        text,
        options: { bullet: { indent: 16 }, breakLine: true },
      })),
      {
        x: 0.7,
        y: 1.9,
        w: 7.5,
        h: 4.4,
        fontSize: 20,
        color: colors.fg,
        paraSpaceAfter: 20,
        valign: "top",
        fit: "shrink",
      },
    );
    const nodes=s.visual.split(/\s*(?:→|->)\s*/).filter(Boolean);
    if(nodes.length>=2 && nodes.length<=4){
      nodes.forEach((text,j)=>{
        const y=1.85+j*1.05;
        slide.addShape(pptx.ShapeType.rect,{x:8.8,y,w:3.7,h:.72,line:{color:colors.accent,width:1.3},fill:{color:colors.bg}});
        slide.addText(text,{x:8.95,y:y+.06,w:3.4,h:.6,fontSize:17,color:colors.fg,align:"center",valign:"middle",fit:"shrink"});
        if(j<nodes.length-1)slide.addShape(pptx.ShapeType.chevron,{x:10.5,y:y+.77,w:.25,h:.2,rotate:90,line:{color:colors.accent},fill:{color:colors.accent}});
      });
    }else slide.addText(s.visual,{x:8.8,y:2,w:3.5,h:3.6,fontSize:22,color:colors.accent,align:"center",valign:"middle",fit:"shrink"});
    slide.addText(`${i + 1} / ${n.deck.slides.length}  ·  Research Notebook`, {
      x: 0.7,
      y: 6.9,
      w: 10,
      h: 0.25,
      fontSize: 10,
      color: colors.fg,
    });
    const sources=n.sources.filter(source=>!n.deck!.sourceIds||n.deck!.sourceIds.includes(source.id));
    slide.addNotes(s.notes+"\n\nSource context\n"+sources.map(source=>`[${source.id}] ${source.title}\n${source.url||""}\n${source.coverage}`).join("\n\n"));
  }
  return await pptx.write({outputType:"blob"}) as Blob;
}
export async function exportPowerPoint(n:Notebook){download(await buildPowerPoint(n),exportFilename(n.deck?.title||n.title,"pptx"));}
export function buildBib(n: Notebook) {
  const clean=(value:string)=>value.replace(/[{}\\%\r\n]/g," ");
  const references=n.summary?.references?.length ? n.summary.references : n.sources.map(s=>({title:s.title,authors:s.authors,url:s.url,year:""}));
  const entries = references.map(
    (r, i) =>
      `@misc{reference${i + 1},\n  title = {${clean(r.title)}},\n  author = {${clean(r.authors||"")}},\n  year = {${clean(r.year||"")}},\n  url = {${clean(r.url||"")}}\n}`,
  );
  return entries.join("\n\n");
}
export function exportBib(n:Notebook){download(new Blob([buildBib(n)],{type:"text/plain;charset=utf-8"}),exportFilename(n.title+" references","bib"));}
