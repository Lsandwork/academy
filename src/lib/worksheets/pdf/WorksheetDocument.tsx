import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import type { WorksheetContent, WorksheetPageContent } from "../types";
import { worksheetTheme as t } from "../theme";

const s = StyleSheet.create({
  page: { backgroundColor: t.sky, paddingBottom: 48, fontFamily: "Helvetica", fontSize: 10, color: t.charcoal },
  sheet: { marginHorizontal: 28, marginTop: 0, backgroundColor: t.white, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 28, paddingTop: 22, paddingBottom: 24, minHeight: 680 },
  headerBand: { marginHorizontal: 28, paddingTop: 22, paddingBottom: 18, paddingHorizontal: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoPill: { backgroundColor: t.orange, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  logoText: { color: t.white, fontSize: 14, fontWeight: "bold" },
  headerTitle: { color: t.white, fontSize: 22, fontWeight: "bold", marginTop: 4 },
  headerSub: { color: "#D6EEFF", fontSize: 11, marginTop: 2 },
  academyLabel: { color: t.orange, fontSize: 8, fontWeight: "bold", letterSpacing: 1.2, marginBottom: 6 },
  headline: { fontSize: 20, fontWeight: "bold", color: t.charcoal, marginBottom: 8, lineHeight: 1.25 },
  body: { fontSize: 10, color: t.muted, lineHeight: 1.5, marginBottom: 10 },
  trainerNote: { backgroundColor: t.peach, borderRadius: t.radius, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: t.peachBorder },
  trainerNoteTitle: { fontSize: 8, fontWeight: "bold", color: t.orange, marginBottom: 4 },
  startHere: { backgroundColor: t.skyLight, borderRadius: t.radius, padding: 12, marginBottom: 12 },
  startGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  startField: { width: "47%", marginBottom: 8 },
  startLabel: { fontSize: 8, fontWeight: "bold", color: t.muted, marginBottom: 4 },
  line: { borderBottomWidth: 1, borderBottomColor: "#CBD5E1", height: 16 },
  sectionRow: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 8 },
  sectionNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: t.orange, alignItems: "center", justifyContent: "center", marginRight: 8 },
  sectionNumText: { color: t.white, fontSize: 11, fontWeight: "bold" },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: t.charcoal },
  cardRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  ruleCard: { flex: 1, backgroundColor: t.lightGray, borderRadius: t.radius, padding: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  ruleTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 4 },
  checklistGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  checkItem: { width: "48%", flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  checkbox: { width: 10, height: 10, borderRadius: 2, borderWidth: 1, borderColor: t.sky, marginRight: 6, marginTop: 1 },
  bullet: { fontSize: 9, color: t.charcoal, lineHeight: 1.4, flex: 1 },
  stepRow: { flexDirection: "row", marginBottom: 6 },
  stepNum: { width: 16, fontSize: 9, fontWeight: "bold", color: t.orange },
  table: { borderRadius: t.radius, overflow: "hidden", marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  tableHead: { flexDirection: "row", backgroundColor: t.sky },
  tableHeadCell: { flex: 1, padding: 6, color: t.white, fontSize: 7, fontWeight: "bold" },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  tableCell: { flex: 1, padding: 8, fontSize: 7, color: t.muted, minHeight: 22 },
  dayRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  dayCard: { flex: 1, borderRadius: t.radius, padding: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  dayBadge: { fontSize: 7, fontWeight: "bold", color: t.white, backgroundColor: t.sky, alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  dayBadgeOrange: { backgroundColor: t.orange },
  decisionRow: { flexDirection: "row", gap: 8, backgroundColor: t.peach, borderRadius: t.radius, padding: 10, marginBottom: 10 },
  decisionItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  decisionCircle: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  reflectionBox: { backgroundColor: t.skyLight, borderRadius: t.radius, padding: 12, marginBottom: 10 },
  reflectionLine: { borderBottomWidth: 1, borderBottomColor: "#B6D9F7", marginTop: 14, marginBottom: 8, height: 14 },
  callout: { borderRadius: t.radius, padding: 10, marginBottom: 10 },
  footer: { position: "absolute", bottom: 16, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#D1D5DB", paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: t.muted },
  scaleRow: { flexDirection: "row", gap: 6, marginTop: 8, marginBottom: 10, flexWrap: "wrap" },
  scaleItem: { flexDirection: "row", alignItems: "center", marginRight: 8, marginBottom: 4 },
  scaleDot: { width: 12, height: 12, borderRadius: 6, marginRight: 4 },
  gridRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  gridCard: { width: "47%", borderRadius: t.radius, padding: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  gridSky: { backgroundColor: t.skyLight },
  gridOrange: { backgroundColor: t.peach }
});

function SectionHeading({ number, title }: { number?: number; title?: string }) {
  if (!title) return null;
  return (
    <View style={s.sectionRow}>
      {number != null && (
        <View style={s.sectionNum}>
          <Text style={s.sectionNumText}>{number}</Text>
        </View>
      )}
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function PageBody({ page, content, pageIndex }: { page: WorksheetPageContent; content: WorksheetContent; pageIndex: number }) {
  const totalPages = content.pages.length;

  return (
    <Page size="LETTER" style={s.page}>
      {pageIndex === 0 && (
        <View style={s.headerBand}>
          <View>
            <View style={s.logoPill}>
              <Text style={s.logoText}>fitdog</Text>
            </View>
            <Text style={s.headerTitle}>{content.courseName}</Text>
            <Text style={s.headerSub}>{content.worksheetSubtitle}</Text>
          </View>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: t.white, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 22 }}>🐾</Text>
          </View>
        </View>
      )}

      <View style={s.sheet}>
        {page.worksheetLabel && pageIndex > 0 && <Text style={s.academyLabel}>{page.worksheetLabel}</Text>}
        {pageIndex === 0 && <Text style={s.academyLabel}>FITDOG TRAINING ACADEMY</Text>}
        {page.headline && <Text style={s.headline}>{page.headline}</Text>}
        {page.intro && <Text style={s.body}>{page.intro}</Text>}
        {page.trainerNote && (
          <View style={s.trainerNote}>
            <Text style={s.trainerNoteTitle}>TRAINER NOTE</Text>
            <Text style={s.body}>{page.trainerNote}</Text>
          </View>
        )}

        {page.startHereFields && (
          <View style={s.startHere}>
            <Text style={[s.sectionTitle, { marginBottom: 8 }]}>Start here</Text>
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
            {page.ruleCards.map((card) => (
              <View key={card.title} style={s.ruleCard}>
                <Text style={s.ruleTitle}>{card.title}</Text>
                <Text style={s.bullet}>{card.body}</Text>
              </View>
            ))}
          </View>
        )}

        <SectionHeading number={page.sectionNumber} title={page.sectionTitle} />

        {page.checklistItems && (
          <View style={s.checklistGrid}>
            {page.checklistItems.map((item) => (
              <View key={item} style={s.checkItem}>
                <View style={s.checkbox} />
                <Text style={s.bullet}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {page.supplies && (
          <View style={{ marginTop: 8, marginBottom: 10 }}>
            <Text style={[s.sectionTitle, { fontSize: 11, marginBottom: 6 }]}>Supplies needed</Text>
            {page.supplies.map((item) => (
              <Text key={item} style={[s.bullet, { marginBottom: 3 }]}>• {item}</Text>
            ))}
          </View>
        )}

        {page.steps && page.steps.map((step, i) => (
          <View key={step} style={s.stepRow}>
            <Text style={s.stepNum}>{i + 1}.</Text>
            <Text style={[s.bullet, { flex: 1 }]}>{step}</Text>
          </View>
        ))}

        {page.gridCards && (
          <View style={s.gridRow}>
            {page.gridCards.map((card) => (
              <View key={card.title} style={[s.gridCard, card.accent === "sky" ? s.gridSky : s.gridOrange]}>
                <Text style={[s.ruleTitle, { color: card.accent === "sky" ? t.sky : t.orange }]}>{card.title}</Text>
                <Text style={s.bullet}>{card.prompt}</Text>
                <View style={[s.line, { marginTop: 8 }]} />
              </View>
            ))}
          </View>
        )}

        {page.table && (
          <View style={s.table}>
            <View style={s.tableHead}>
              {page.table.headers.map((h) => (
                <Text key={h} style={s.tableHeadCell}>{h}</Text>
              ))}
            </View>
            {page.table.rows.map((row, ri) => (
              <View key={ri} style={s.tableRow}>
                {row.map((cell, ci) => (
                  <Text key={ci} style={s.tableCell}>{cell}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {page.bodyLanguageScale && (
          <View style={s.scaleRow}>
            {page.bodyLanguageScale.map((item) => (
              <View key={item.score} style={s.scaleItem}>
                <View style={[s.scaleDot, { backgroundColor: item.color }]} />
                <Text style={s.bullet}>{item.score} {item.label}</Text>
              </View>
            ))}
          </View>
        )}

        {page.dayCards && (
          <View style={s.dayRow}>
            {page.dayCards.map((card) => (
              <View key={card.day} style={[s.dayCard, { backgroundColor: card.accent === "orange" ? t.peach : t.skyLight }]}>
                <Text style={[s.dayBadge, card.accent === "orange" ? s.dayBadgeOrange : {}]}>{card.day}</Text>
                <Text style={s.ruleTitle}>{card.title}</Text>
                <Text style={s.bullet}>{card.body}</Text>
              </View>
            ))}
          </View>
        )}

        {page.callout && (
          <View style={[s.callout, { backgroundColor: page.callout.variant === "peach" ? t.peach : t.skyLight }]}>
            <Text style={s.trainerNoteTitle}>{page.callout.title.toUpperCase()}</Text>
            <Text style={s.bullet}>{page.callout.body}</Text>
          </View>
        )}

        {page.decisionOptions && (
          <View style={s.decisionRow}>
            {page.decisionOptions.map((opt) => (
              <View key={opt.label} style={s.decisionItem}>
                <View style={[s.decisionCircle, { backgroundColor: opt.accent === "green" ? t.green : opt.accent === "sky" ? t.sky : t.orange }]}>
                  <Text style={{ color: t.white, fontSize: 9, fontWeight: "bold" }}>{opt.label}</Text>
                </View>
                <Text style={[s.bullet, { flex: 1 }]}>{opt.action}</Text>
              </View>
            ))}
          </View>
        )}

        {page.mistakes && page.mistakes.map((m) => (
          <Text key={m} style={[s.bullet, { marginBottom: 4 }]}>• {m}</Text>
        ))}

        {page.troubleshooting && page.troubleshooting.map((row) => (
          <View key={row.trigger} style={{ marginBottom: 6 }}>
            <Text style={[s.bullet, { fontWeight: "bold" }]}>If: {row.trigger}</Text>
            <Text style={s.bullet}>Try: {row.tryThis}</Text>
          </View>
        ))}

        {page.successChecklist && page.successChecklist.map((item) => (
          <View key={item} style={s.checkItem}>
            <View style={s.checkbox} />
            <Text style={s.bullet}>{item}</Text>
          </View>
        ))}

        {page.homework && (
          <View style={{ marginTop: 8 }}>
            <Text style={s.bullet}>{page.homework}</Text>
          </View>
        )}

        {page.reflectionPrompts && (
          <View style={s.reflectionBox}>
            {page.reflectionPrompts.map((prompt) => (
              <View key={prompt}>
                <Text style={[s.bullet, { fontWeight: "bold" }]}>{prompt}</Text>
                <View style={s.reflectionLine} />
              </View>
            ))}
          </View>
        )}

        {page.safetyNote && (
          <View style={[s.trainerNote, { marginTop: 8 }]}>
            <Text style={s.trainerNoteTitle}>WELFARE / SAFETY</Text>
            <Text style={s.bullet}>{page.safetyNote}</Text>
          </View>
        )}

        {pageIndex === 0 && (
          <View style={{ marginTop: 12, padding: 10, backgroundColor: t.lightGray, borderRadius: t.radius }}>
            <Text style={s.trainerNoteTitle}>TRAINING GOAL</Text>
            <Text style={s.bullet}>{content.trainingGoal}</Text>
          </View>
        )}
      </View>

      <View style={s.footer} fixed>
        <Text style={s.footerText}>Fitdog Health & Social Club | academy.ruffops.com</Text>
        <Text style={s.footerText}>{content.footerTitle}</Text>
        <Text style={s.footerText}>Page {pageIndex + 1}</Text>
      </View>
    </Page>
  );
}

export function WorksheetDocument({ content }: { content: WorksheetContent }) {
  return (
    <Document title={`${content.lessonTitle} Worksheet`} author="Fitdog Training Academy">
      {content.pages.map((page, i) => (
        <PageBody key={i} page={page} content={content} pageIndex={i} />
      ))}
    </Document>
  );
}
