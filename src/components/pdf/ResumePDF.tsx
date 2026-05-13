'use client';

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { OptimizedResumeData } from '@/types/resume';

interface Props {
  data: OptimizedResumeData;
  templateId: number;
}

export default function ResumePDF({ data, templateId }: Props) {
  
  const isOriginal = templateId === 0;
  const isBlue = templateId === 2;
  const isEmerald = templateId === 5;
  const isSlate = templateId === 6;
  const isElite = templateId === 7;

  const displayData = isOriginal ? {
    ...data,
    personalInfo: {
      ...data.personalInfo,
      summary: (data.personalInfo as any)._metadata?.original || data.personalInfo.summary
    },
    experience: data.experience.map((exp: any) => ({
      ...exp,
      position: exp._metadata?.originalPosition || exp.position,
      description: exp._metadata?.originalDescription || exp.description
    }))
  } : data;

  const styles = StyleSheet.create({
    page: { padding: 0, fontFamily: 'Helvetica', color: '#333' },
    
    // --- ELITE PORTFOLIO EXPANDED (ID 7) ---
    eliteContainer: { padding: '45 40' },
    eliteHeader: { marginBottom: 15 },
    eliteName: { fontSize: 30, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', color: '#1a1a1a' },
    eliteSubName: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#666', marginTop: 5 },
    eliteLine: { height: 1.5, backgroundColor: '#1a1a1a', marginVertical: 15 },
    eliteContactRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 25 },
    eliteContactItem: { fontSize: 8.5, color: '#444' },
    eliteVerticalLine: { width: 1, height: 12, backgroundColor: '#ccc' },
    eliteProfileBox: { backgroundColor: '#2d2d2d', padding: '25 30', color: '#fff', marginBottom: 35 },
    eliteProfileTitle: { fontSize: 11, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
    eliteBody: { flexDirection: 'row', gap: 45 },
    eliteLeftCol: { width: '35%' },
    eliteRightCol: { width: '65%' },
    eliteSectionTitle: { fontSize: 10.5, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', borderBottomWidth: 1.5, borderBottomColor: '#1a1a1a', paddingBottom: 6, marginBottom: 18, color: '#1a1a1a' },
    eliteSkillRow: { marginBottom: 15 },
    eliteProgressBar: { height: 3, backgroundColor: '#eee', marginTop: 5, position: 'relative' },
    eliteProgressFill: { height: 3, backgroundColor: '#1a1a1a', position: 'absolute', left: 0, top: 0 },
    eliteExpItem: { marginBottom: 25 },
    eliteExpPos: { fontSize: 10.5, fontWeight: 'bold', textTransform: 'uppercase', color: '#1a1a1a' },
    eliteExpComp: { fontSize: 9.5, fontStyle: 'italic', color: '#666', marginBottom: 6 },
    eliteGdpr: { marginTop: 30, textAlign: 'center', fontSize: 7.5, color: '#999' },
    
    // --- COMMON STYLES & TWO COLUMN ---
    standardText: { fontSize: 9.5, lineHeight: 1.4, textAlign: 'justify' },
    sidebar: { width: '32%', backgroundColor: isBlue ? '#1d4ed8' : isEmerald ? '#064e3b' : '#333', padding: 25, color: '#fff' },
    main: { width: '68%', padding: 35, backgroundColor: '#fff' },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: isBlue ? '#1d4ed8' : isEmerald ? '#064e3b' : '#333', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },

    // --- SLATE MODERN (ID 6) ---
    slateHeader: { backgroundColor: '#334155', padding: 40, color: '#fff' },
    slateName: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
    slateContactRow: { flexDirection: 'row', gap: 15, opacity: 0.9, fontSize: 8.5 },
    slateBody: { padding: 40 },
    slateSectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#334155', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 5, marginBottom: 15, marginTop: 20 },
  });

  const EliteTemplate = () => (
    <Page size="A4" style={styles.page}>
      <View style={styles.eliteContainer}>
        <View style={styles.eliteHeader} wrap={false}>
          <Text style={styles.eliteName}>{displayData.personalInfo.fullName}</Text>
          <Text style={styles.eliteSubName}>{displayData.personalInfo.title || 'Technical Professional'}</Text>
        </View>
        <View style={styles.eliteLine} wrap={false} />
        <View style={styles.eliteContactRow} wrap={false}>
          <Text style={styles.eliteContactItem}>{displayData.personalInfo.phone}</Text>
          <View style={styles.eliteVerticalLine} />
          <Text style={styles.eliteContactItem}>{displayData.personalInfo.email}</Text>
          <View style={styles.eliteVerticalLine} />
          <Text style={styles.eliteContactItem}>{displayData.personalInfo.location}</Text>
        </View>
        <View style={styles.eliteProfileBox} wrap={false}>
          <Text style={styles.eliteProfileTitle}>Profilo</Text>
          <Text style={[styles.standardText, { color: '#fff', textAlign: 'left' }]}>{displayData.personalInfo.summary}</Text>
        </View>
        <View style={styles.eliteBody}>
          <View style={styles.eliteLeftCol}>
            <Text style={styles.eliteSectionTitle} wrap={false}>Istruzione</Text>
            {displayData.education?.map((edu: any, i: number) => (
              <View key={i} style={{ marginBottom: 15 }} wrap={false}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{edu.degree}</Text>
                <Text style={{ fontSize: 8.5, color: '#666' }}>{edu.school}</Text>
              </View>
            ))}
            <Text style={[styles.eliteSectionTitle, { marginTop: 25 }]} wrap={false}>Skills</Text>
            {displayData.skills.map((s, i) => (
              <View key={i} style={styles.eliteSkillRow} wrap={false}>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{s.name}</Text>
                <View style={styles.eliteProgressBar}>
                  <View style={[styles.eliteProgressFill, { width: s.level === 'Expert' ? '100%' : s.level === 'Advanced' ? '80%' : '50%' }]} />
                </View>
              </View>
            ))}
          </View>
          <View style={styles.eliteRightCol}>
            <Text style={styles.eliteSectionTitle} wrap={false}>Esperienza Lavorativa</Text>
            {displayData.experience.map((exp: any, i: number) => (
              <View key={i} style={styles.eliteExpItem} wrap={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={styles.eliteExpPos}>{exp.position}</Text>
                  <Text style={{ fontSize: 8.5, color: '#999' }}>{exp.startDate} - {exp.current ? 'Presente' : exp.endDate}</Text>
                </View>
                <Text style={styles.eliteExpComp}>{exp.company}</Text>
                <Text style={styles.standardText}>{exp.description}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.eliteGdpr} wrap={false}>Autorizzo il trattamento dei dati personali (D. Lgs. 196/2003 e GDPR 679/16).</Text>
      </View>
    </Page>
  );

  const TwoColumnLayout = () => (
    <Page size="A4" style={styles.page}>
      <View style={{ flexDirection: 'row', minHeight: '100%' }}>
        <View style={styles.sidebar}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }} wrap={false}>{displayData.personalInfo.fullName}</Text>
          <Text style={{ fontSize: 8.5, marginBottom: 5 }} wrap={false}>{displayData.personalInfo.email}</Text>
          <Text style={{ fontSize: 8.5, marginBottom: 25 }} wrap={false}>{displayData.personalInfo.phone}</Text>
          <Text style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: 10, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 5 }} wrap={false}>Competenze</Text>
          {displayData.skills.map((s, i) => (
            <Text key={i} style={{ fontSize: 9, marginBottom: 6 }} wrap={false}>• {s.name}</Text>
          ))}
        </View>
        <View style={styles.main}>
          <Text style={styles.sectionTitle} wrap={false}>Profilo Professionale</Text>
          <Text style={styles.standardText} wrap={false}>{displayData.personalInfo.summary}</Text>
          <Text style={[styles.sectionTitle, { marginTop: 25 }]} wrap={false}>Esperienza</Text>
          {displayData.experience.map((exp: any, i: number) => (
            <View key={i} style={{ marginBottom: 20 }} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 10.5 }}>{exp.position}</Text>
                <Text style={{ fontSize: 8.5, color: '#666' }}>{exp.startDate} - {exp.current ? 'Presente' : exp.endDate}</Text>
              </View>
              <Text style={{ fontSize: 9.5, color: isBlue ? '#1d4ed8' : isEmerald ? '#064e3b' : '#333', fontStyle: 'italic', marginBottom: 4 }}>{exp.company}</Text>
              <Text style={styles.standardText}>{exp.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  );

  const SlateTemplate = () => (
    <Page size="A4" style={styles.page}>
      <View>
        <View style={styles.slateHeader} wrap={false}>
          <Text style={styles.slateName}>{displayData.personalInfo.fullName}</Text>
          <View style={styles.slateContactRow}>
            <Text>{displayData.personalInfo.email}</Text>
            <Text>•</Text>
            <Text>{displayData.personalInfo.phone}</Text>
            <Text>•</Text>
            <Text>{displayData.personalInfo.location}</Text>
          </View>
        </View>
        <View style={styles.slateBody}>
          <Text style={styles.slateSectionTitle} wrap={false}>Profilo Professionale</Text>
          <Text style={styles.standardText} wrap={false}>{displayData.personalInfo.summary}</Text>
          
          <Text style={styles.slateSectionTitle} wrap={false}>Esperienza Lavorativa</Text>
          {displayData.experience.map((exp: any, i: number) => (
            <View key={i} style={{ marginBottom: 20 }} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 10.5 }}>{exp.company}</Text>
                <Text style={{ fontSize: 8.5, color: '#666' }}>{exp.startDate} - {exp.current ? 'Presente' : exp.endDate}</Text>
              </View>
              <Text style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#334155', fontSize: 9.5, marginBottom: 4 }}>{exp.position}</Text>
              <Text style={styles.standardText}>{exp.description}</Text>
            </View>
          ))}

          <Text style={styles.slateSectionTitle} wrap={false}>Competenze & Skill</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {displayData.skills.map((s, i) => (
              <Text key={i} style={{ fontSize: 8.5, padding: '4 10', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: 4, marginRight: 6, marginBottom: 6 }} wrap={false}>{s.name}</Text>
            ))}
          </View>
        </View>
      </View>
    </Page>
  );

  return (
    <Document>
      {isElite ? <EliteTemplate /> : (isSlate ? <SlateTemplate /> : <TwoColumnLayout />)}
    </Document>
  );
}
