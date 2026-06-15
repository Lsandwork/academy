import React from "react";
import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { WorksheetBrandAssets } from "../brandAssets";
import type { WorksheetContent, WorksheetPageContent, WorksheetSection } from "../types";
import { worksheetTheme as t } from "../theme";

const s = StyleSheet.create({
  pageCover: { backgroundColor: t.sky, paddingBottom: 44, fontFamily: "Helvetica", fontSize: 9.5, color: t.charcoal },
  pageInner: { backgroundColor: t.white, paddingBottom: 44, fontFamily: "Helvetica", fontSize: 9.5, color: t.charcoal },
  headerBand: {
    marginHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerLeft: { flex: 1, paddingRight: 10 },
  logoPill: { backgroundColor: t.orange, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 6, alignSelf: "flex-start" },
  wordmark: { width: 82, height: 21, objectFit: "contain" },
  headerTitle: { color: t.white, fontSize: 19, fontWeight: "bold", marginTop: 8, lineHeight: 1.15 },
  headerSub: { color: "#D6EEFF", fontSize: 9.5, marginTop: 2 },
  headerIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: t.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  headerIcon: { width: 42, height: 42, objectFit: "contain" },
  sheetCover: {
    marginHorizontal: 24,
    backgroundColor: t.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 18,
    flexGrow: 1
  },
  sheetInner: { paddingHorizontal: 32, paddingTop: 14, paddingBottom: 16, flexGrow: 1 },
  topStripe: { height: 5, backgroundColor: t.sky },
  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: t.charcoal,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12
  },
  compactWordmark: { width: 58, height: 15, objectFit: "contain" },
  compactTitle: { color: t.white, fontSize: 7.5, fontWeight: "bold", flex: 1, textAlign: "center", paddingHorizontal: 6 },
  compactIcon: { width: 20, height: 20, objectFit: "contain" },
  brandLockup: { width: 132, height: 26, objectFit: "contain", marginBottom: 4 },
  academyLabel: { color: t.orange, fontSize: 7.5, fontWeight: "bold", letterSpacing: 1.1, marginBottom: 4 },
  lessonTitle: { fontSize: 11, fontWeight: "bold", color: t.charcoal, marginBottom: 6 },
  headline: { fontSize: 17, fontWeight: "bold", color: t.charcoal, marginBottom: 5, lineHeight: 1.2 },
  body: { fontSize: 9.5, color: t.muted, lineHeight: 1.45, marginBottom: 8 },
  keySkillsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  keySkillPill: {
    backgroundColor: t.skyLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 4
  },
  keySkillText: { fontSize: 7.5, color: t.sky, fontWeight: "bold" },
  trainerNote: {
    backgroundColor: t.peach,
    borderRadius: t.radius,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: t.peachBorder
  },
  trainerNoteTitle: { fontSize: 7, fontWeight: "bold", color: t.orange, marginBottom: 3, letterSpacing: 0.5 },
  startHere: { backgroundColor: t.skyLight, borderRadius: t.radius, padding: 10, marginBottom: 8 },
  startGrid: { flexDirection: "row", flexWrap: "wrap" },
  startField: { width: "48%", marginBottom: 6, paddingRight: 8 },
  startLabel: { fontSize: 7, fontWeight: "bold", color: t.muted, marginBottom: 3 },
  line: { borderBottomWidth: 1, borderBottomColor: "#CBD5E1", height: 14 },
  cardRow: { flexDirection: "row", marginBottom: 8 },
  ruleCard: { flex: 1, backgroundColor: t.lightGray, borderRadius: t.radius, padding: 8, borderWidth: 1, borderColor: "#E5E7EB", marginRight: 6 },
  ruleTitle: { fontSize: 8, fontWeight: "bold", marginBottom: 3, color: t.charcoal },
  sectionRow: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 5 },
  sectionNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: t.orange,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6
  },
  sectionNumText: { color: t.white, fontSize: 9, fontWeight: "bold" },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: t.charcoal },
  checklistGrid: { flexDirection: "row", flexWrap: "wrap" },
  checkItem: { width: "48%", flexDirection: "row", alignItems: "flex-start", marginBottom: 4, paddingRight: 6 },
  checkbox: { width: 9, height: 9, borderRadius: 2, borderWidth: 1, borderColor: t.sky, marginRight: 5, marginTop: 1 },
  bullet: { fontSize: 9.5, color: t.charcoal, lineHeight: 1.45, flex: 1 },
  suppliesBox: { backgroundColor: t.lightGray, borderRadius: t.radius, padding: 8, marginTop: 4, marginBottom: 4 },
  stepRow: { flexDirection: "row", marginBottom: 4 },
  stepNum: { width: 14, fontSize: 8.5, fontWeight: "bold", color: t.orange },
  table: { borderRadius: t.radius, overflow: "hidden", marginBottom: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  tableHead: { flexDirection: "row", backgroundColor: t.sky },
  tableHeadCell: { flex: 1, padding: 5, color: t.white, fontSize: 6.5, fontWeight: "bold" },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  tableCell: { flex: 1, padding: 6, fontSize: 6.5, color: t.muted, minHeight: 18 },
  splitRow: { flexDirection: "row", marginBottom: 6 },
  splitCol: { flex: 1, paddingRight: 8 },
  splitTitle: { fontSize: 8, fontWeight: "bold", color: t.orange, marginBottom: 4 },
  dayRow: { flexDirection: "row", marginBottom: 6 },
  dayCard: { flex: 1, borderRadius: t.radius, padding: 6, borderWidth: 1, borderColor: "#E5E7EB", marginRight: 4 },
  dayBadge: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: t.white,
    backgroundColor: t.sky,
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginBottom: 3
  },
  dayBadgeOrange: { backgroundColor: t.orange },
  decisionRow: { flexDirection: "row", backgroundColor: t.peach, borderRadius: t.radius, padding: 8, marginBottom: 8 },
  decisionItem: { flex: 1, flexDirection: "row", alignItems: "center", marginRight: 6 },
  decisionCircle: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 5 },
  callout: { borderRadius: t.radius, padding: 8, marginBottom: 6 },
  reflectionBox: { backgroundColor: t.skyLight, borderRadius: t.radius, padding: 10, marginBottom: 6 },
  reflectionLine: { borderBottomWidth: 1, borderBottomColor: "#B6D9F7", marginTop: 10, marginBottom: 6, height: 12 },
  scaleRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4, marginBottom: 6 },
  scaleItem: { flexDirection: "row", alignItems: "center", marginRight: 10, marginBottom: 3 },
  scaleDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  gridRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
  gridCard: { width: "48%", borderRadius: t.radius, padding: 8, borderWidth: 1, borderColor: "#E5E7EB", marginRight: 6, marginBottom: 6 },
  gridSky: { backgroundColor: t.skyLight },
  gridOrange: { backgroundColor: t.peach },
  footer: {
    position: "absolute",
    bottom: 12,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  footerLeft: { flexDirection: "row", alignItems: "center", maxWidth: "42%" },
  footerIcon: { width: 12, height: 12, objectFit: "contain", marginRight: 5 },
  footerText: { fontSize: 6.5, color: t.muted }
});

function SectionHeading({ number, title }: { number?: number; title?: string }) {
  if (!title) return null;
  return (
    <View style={s.sectionRow} wrap={false}>
      {number != null && (
        <View style={s.sectionNum}>
          <Text style={s.sectionNumText}>{number}</Text>
        </View>
      )}
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function BrandedFooter({
  brand,
  footerTitle,
  pageNumber,
  totalPages
}: {
  brand: WorksheetBrandAssets;
  footerTitle: string;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <View style={s.footer} fixed>
      <View style={s.footerLeft}>
        <Image src={brand.dogHead} style={s.footerIcon} />
        <Text style={s.footerText}>Fitdog Health & Social Club · academy.ruffops.com</Text>
      </View>
      <Text style={s.footerText}>{footerTitle}</Text>
      <Text style={s.footerText}>
        {pageNumber} / {totalPages}
      </Text>
    </View>
  );
}

function WorksheetSectionBlock({ section }: { section: WorksheetSection }) {
  return (
    <View>
      <SectionHeading number={section.sectionNumber} title={section.sectionTitle} />

      {section.callout && (
        <View style={[s.callout, { backgroundColor: section.callout.variant === "peach" ? t.peach : t.skyLight }]}>
          <Text style={s.trainerNoteTitle}>{section.callout.title.toUpperCase()}</Text>
          <Text style={s.bullet}>{section.callout.body}</Text>
        </View>
      )}

      {section.checklistItems && (
        <View style={s.checklistGrid}>
          {section.checklistItems.map((item) => (
            <View key={item} style={s.checkItem}>
              <View style={s.checkbox} />
              <Text style={s.bullet}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {section.supplies && (
        <View style={s.suppliesBox}>
          <Text style={[s.ruleTitle, { marginBottom: 4 }]}>Supplies needed</Text>
          {section.supplies.map((item) => (
            <Text key={item} style={[s.bullet, { marginBottom: 2 }]}>
              • {item}
            </Text>
          ))}
        </View>
      )}

      {section.steps &&
        section.steps.map((step, i) => (
          <View key={`${i}-${step.slice(0, 24)}`} style={s.stepRow}>
            <Text style={s.stepNum}>{step.match(/^\d+\./) ? "" : `${i + 1}.`}</Text>
            <Text style={[s.bullet, { flex: 1 }]}>{step.replace(/^\d+\.\s*/, "")}</Text>
          </View>
        ))}

      {section.gridCards && (
        <View style={s.gridRow}>
          {section.gridCards.map((card) => (
            <View key={card.title} style={[s.gridCard, card.accent === "sky" ? s.gridSky : s.gridOrange]}>
              <Text style={[s.ruleTitle, { color: card.accent === "sky" ? t.sky : t.orange }]}>{card.title}</Text>
              <Text style={s.bullet}>{card.prompt}</Text>
              <View style={[s.line, { marginTop: 6 }]} />
            </View>
          ))}
        </View>
      )}

      {section.table && (
        <View style={s.table}>
          <View style={s.tableHead}>
            {section.table.headers.map((h) => (
              <Text key={h} style={s.tableHeadCell}>
                {h}
              </Text>
            ))}
          </View>
          {section.table.rows.map((row, ri) => (
            <View key={ri} style={s.tableRow}>
              {row.map((cell, ci) => (
                <Text key={ci} style={s.tableCell}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {section.bodyLanguageScale && (
        <View style={s.scaleRow}>
          {section.bodyLanguageScale.map((item) => (
            <View key={item.score} style={s.scaleItem}>
              <View style={[s.scaleDot, { backgroundColor: item.color }]} />
              <Text style={s.bullet}>
                {item.score} {item.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {section.dayCards && (
        <View style={s.dayRow}>
          {section.dayCards.map((card) => (
            <View key={card.day} style={[s.dayCard, { backgroundColor: card.accent === "orange" ? t.peach : t.skyLight }]}>
              <Text style={[s.dayBadge, card.accent === "orange" ? s.dayBadgeOrange : {}]}>{card.day}</Text>
              <Text style={s.ruleTitle}>{card.title}</Text>
              <Text style={s.bullet}>{card.body}</Text>
            </View>
          ))}
        </View>
      )}

      {section.decisionOptions && (
        <View style={s.decisionRow}>
          {section.decisionOptions.map((opt) => (
            <View key={opt.label} style={s.decisionItem}>
              <View
                style={[
                  s.decisionCircle,
                  { backgroundColor: opt.accent === "green" ? t.green : opt.accent === "sky" ? t.sky : t.orange }
                ]}
              >
                <Text style={{ color: t.white, fontSize: 8, fontWeight: "bold" }}>{opt.label}</Text>
              </View>
              <Text style={[s.bullet, { flex: 1 }]}>{opt.action}</Text>
            </View>
          ))}
        </View>
      )}

      {section.mistakes && section.mistakes.length > 0 && (
        <View style={{ marginBottom: 6 }}>
          <Text style={[s.splitTitle, { marginBottom: 4 }]}>AVOID THESE</Text>
          {section.mistakes.map((m) => (
            <Text key={m} style={[s.bullet, { marginBottom: 4 }]}>
              • {m}
            </Text>
          ))}
        </View>
      )}

      {section.troubleshooting && section.troubleshooting.length > 0 && (
        <View style={{ marginTop: 4, marginBottom: 6 }}>
          <Text style={[s.splitTitle, { marginBottom: 4 }]}>IF THIS HAPPENS, TRY THIS</Text>
          {section.troubleshooting.map((row) => (
            <View key={row.trigger} style={{ marginBottom: 5 }} wrap={false}>
              <Text style={[s.bullet, { fontWeight: "bold" }]}>{row.trigger}</Text>
              <Text style={s.bullet}>Try: {row.tryThis}</Text>
            </View>
          ))}
        </View>
      )}

      {section.successChecklist && (
        <View style={s.checklistGrid}>
          {section.successChecklist.map((item) => (
            <View key={item} style={[s.checkItem, { width: "100%" }]}>
              <View style={s.checkbox} />
              <Text style={s.bullet}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {section.homework && (
        <View style={[s.callout, { backgroundColor: t.lightGray }]}>
          <Text style={s.bullet}>{section.homework}</Text>
        </View>
      )}

      {section.reflectionPrompts && (
        <View style={s.reflectionBox}>
          {section.reflectionPrompts.map((prompt) => (
            <View key={prompt}>
              <Text style={[s.bullet, { fontWeight: "bold" }]}>{prompt}</Text>
              <View style={s.reflectionLine} />
            </View>
          ))}
        </View>
      )}

      {section.safetyNote && (
        <View style={s.trainerNote}>
          <Text style={s.trainerNoteTitle}>WELFARE / SAFETY</Text>
          <Text style={s.bullet}>{section.safetyNote}</Text>
        </View>
      )}
    </View>
  );
}

function PageBody({
  page,
  content,
  brand,
  pageIndex,
  totalPages
}: {
  page: WorksheetPageContent;
  content: WorksheetContent;
  brand: WorksheetBrandAssets;
  pageIndex: number;
  totalPages: number;
}) {
  const isCover = page.isCover === true;

  return (
    <Page size="LETTER" style={isCover ? s.pageCover : s.pageInner} wrap>
      {!isCover && <View style={s.topStripe} fixed />}

      {isCover && (
        <View style={s.headerBand}>
          <View style={s.headerLeft}>
            <View style={s.logoPill}>
              <Image src={brand.wordmarkWhite} style={s.wordmark} />
            </View>
            <Text style={s.headerTitle}>{content.courseName}</Text>
            <Text style={s.headerSub}>{content.worksheetSubtitle}</Text>
          </View>
          <View style={s.headerIconWrap}>
            <Image src={brand.dogHead} style={s.headerIcon} />
          </View>
        </View>
      )}

      <View style={isCover ? s.sheetCover : s.sheetInner}>
        {!isCover && (
          <View style={s.compactHeader}>
            <Image src={brand.wordmarkWhite} style={s.compactWordmark} />
            <Text style={s.compactTitle}>{content.lessonTitle}</Text>
            <Image src={brand.dogHead} style={s.compactIcon} />
          </View>
        )}

        {isCover && (
          <>
            <Image src={brand.academyLockup} style={s.brandLockup} />
            <Text style={s.academyLabel}>FITDOG TRAINING ACADEMY</Text>
            <Text style={s.lessonTitle}>{content.lessonTitle}</Text>
          </>
        )}

        {page.worksheetLabel && !isCover && <Text style={s.academyLabel}>{page.worksheetLabel}</Text>}
        {page.headline && <Text style={s.headline}>{page.headline}</Text>}
        {page.intro && <Text style={s.body}>{page.intro}</Text>}

        {page.keySkills && page.keySkills.length > 0 && (
          <View style={s.keySkillsRow}>
            {page.keySkills.map((skill) => (
              <View key={skill} style={s.keySkillPill}>
                <Text style={s.keySkillText}>{skill}</Text>
              </View>
            ))}
          </View>
        )}

        {page.trainerNote && (
          <View style={s.trainerNote}>
            <Text style={s.trainerNoteTitle}>TRAINER NOTE</Text>
            <Text style={s.bullet}>{page.trainerNote}</Text>
          </View>
        )}

        {page.startHereFields && (
          <View style={s.startHere}>
            <Text style={[s.sectionTitle, { fontSize: 10, marginBottom: 6 }]}>Start here</Text>
            <View style={s.startGrid}>
              {page.startHereFields.map((field) => (
                <View key={field} style={s.startField}>
                  <Text style={s.startLabel}>{field}</Text>
                  <View style={s.line} />
                </View>
              ))}
            </View>
          </View>
        )}

        {page.ruleCards && (
          <View style={s.cardRow}>
            {page.ruleCards.map((card, i) => (
              <View key={card.title} style={[s.ruleCard, i === page.ruleCards!.length - 1 ? { marginRight: 0 } : {}]}>
                <Text style={s.ruleTitle}>{card.title}</Text>
                <Text style={s.bullet}>{card.body}</Text>
              </View>
            ))}
          </View>
        )}

        {page.sections.map((section, i) => (
          <WorksheetSectionBlock key={`${section.sectionNumber}-${section.sectionTitle}-${i}`} section={section} />
        ))}
      </View>

      <BrandedFooter brand={brand} footerTitle={content.footerTitle} pageNumber={pageIndex + 1} totalPages={totalPages} />
    </Page>
  );
}

export function WorksheetDocument({ content, brand }: { content: WorksheetContent; brand: WorksheetBrandAssets }) {
  const totalPages = content.pages.length;
  return (
    <Document
      title={`${content.lessonTitle} — Fitdog Training Worksheet`}
      author="Fitdog Health & Social Club"
      subject={`${content.courseName} | Fitdog Training Academy`}
    >
      {content.pages.map((page, i) => (
        <PageBody key={i} page={page} content={content} brand={brand} pageIndex={i} totalPages={totalPages} />
      ))}
    </Document>
  );
}
