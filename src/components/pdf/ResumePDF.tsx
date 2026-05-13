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
    
    // --- ELITE PORTFOLIO COMPACT (ID 7) ---
    eliteContainer: { padding: '30 35' },
    eliteHeader: { marginBottom: 10, textAlign: 'left' },
    eliteName: { fontSize: 26, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase', color: '#1a1a1a' },
    eliteSubName: { fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#666', marginTop: 3 },
    eliteLine: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    eliteContactRow: { flexDirection: 'row', justifyContent: 'flex-start', gap: 12, marginBottom: 15 },
    eliteContactItem: { fontSize: 7, color: '#444' },
    eliteVerticalLine: { width: 1, height: 8, backgroundColor: '#ccc' },
    eliteProfileBox: { backgroundColor: '#2d2d2d', padding: '15 20', color: '#fff', marginBottom: 20 },
    eliteProfileTitle: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 },
    eliteBody: { flexDirection: 'row', gap: 25 },
    eliteLeftCol: { width: '32%' },
    eliteRightCol: { width: '68%' },
    eliteSectionTitle: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 3, marginBottom: 10, color: '#1a1a1a' },
    eliteSkillRow: { marginBottom: 8 },
    eliteProgressBar: { height: 2, backgroundColor: '#eee', marginTop: 3, position: 'relative' },
    eliteProgressFill: { height: 2, backgroundColor: '#333', position: 'absolute', left: 0, top: 0 },
    eliteExpItem: { marginBottom: 12 },
    eliteExpPos: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', color: '#1a1a1a' },
    eliteExpComp: { fontSize: 8, fontStyle: 'italic', color: '#666', marginBottom: 3 },
    eliteGdpr: { position: 'absolute', bottom: 15, left: 0, right: 0, textAlign: 'center', fontSize: 6.5, color: '#999' },
    
    // --- COMMON STYLES ---
    standardText: { fontSize: 8, lineHeight: 1.3, textAlign: 'justify' },
    sidebar: { width: '32%', backgroundColor: isBlue ? '#1d4ed8' : '#064e3b', padding: 20, color: '#fff' },
    main: { width: '68%', padding: 25, backgroundColor: '#fff' },
    sectionTitle: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: isBlue ? '#1d4ed8' : '#064e3b', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 4 },
  });

  const EliteTemplate = () => (
    <View style={styles.eliteContainer}>
      <View style={styles.eliteHeader}>
        <Text style={styles.eliteName}>{displayData.personalInfo.fullName}</Text>
        <Text style={styles.eliteSubName}>{displayData.personalInfo.title || 'Technical Professional'}</Text>
      </View>
      <View style={styles.eliteLine} />
      <View style={styles.eliteContactRow}>
        <Text style={styles.eliteContactItem}>{displayData.personalInfo.phone}</Text>
        <View style={styles.eliteVerticalLine} />
        <Text style={styles.eliteContactItem}>{displayData.personalInfo.email}</Text>
        <View style={styles.eliteVerticalLine} />
        <Text style={styles.eliteContactItem}>{displayData.personalInfo.location}</Text>
      </View>
      <View style={styles.eliteProfileBox}>
        <Text style={styles.eliteProfileTitle}>Profilo</Text>
        <Text style={[styles.standardText, { color: '#fff', textAlign: 'left' }]}>{displayData.personalInfo.summary}</Text>
      </View>
      <View style={styles.eliteBody}>
        <View style={styles.eliteLeftCol}>
          <Text style={styles.eliteSectionTitle}>Istruzione</Text>
          {displayData.education?.map((edu: any, i: number) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 8.5, fontWeight: 'bold' }}>{edu.degree}</Text>
              <Text style={{ fontSize: 7.5, color: '#666' }}>{edu.school}</Text>
            </View>
          ))}
          <Text style={[styles.eliteSectionTitle, { marginTop: 15 }]}>Skills</Text>
          {displayData.skills.map((s, i) => (
            <View key={i} style={styles.eliteSkillRow}>
              <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>{s.name}</Text>
              <View style={styles.eliteProgressBar}>
                <View style={[styles.eliteProgressFill, { width: s.level === 'Expert' ? '100%' : s.level === 'Advanced' ? '80%' : '50%' }]} />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.eliteRightCol}>
          <Text style={styles.eliteSectionTitle}>Esperienza Lavorativa</Text>
          {displayData.experience.map((exp: any, i: number) => (
            <View key={i} style={styles.eliteExpItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.eliteExpPos}>{exp.position}</Text>
                <Text style={{ fontSize: 7, color: '#999' }}>{exp.startDate} - {exp.current ? 'Presente' : exp.endDate}</Text>
              </View>
              <Text style={styles.eliteExpComp}>{exp.company}</Text>
              <Text style={styles.standardText}>{exp.description}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.eliteGdpr}>Autorizzo il trattamento dei dati personali (D. Lgs. 196/2003 e GDPR 679/16).</Text>
    </View>
  );

  const TwoColumnLayout = () => (
    <View style={{ flexDirection: 'row', height: '100%' }}>
      <View style={styles.sidebar}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{displayData.personalInfo.fullName}</Text>
        <Text style={{ fontSize: 7.5, marginBottom: 20 }}>{displayData.personalInfo.email} | {displayData.personalInfo.phone}</Text>
        <Text style={styles.sectionTitle}>Competenze</Text>
        {displayData.skills.map((s, i) => (
          <Text key={i} style={{ fontSize: 8, marginBottom: 4 }}>• {s.name}</Text>
        ))}
      </View>
      <View style={styles.main}>
        <Text style={styles.sectionTitle}>Profilo Professionale</Text>
        <Text style={styles.standardText}>{displayData.personalInfo.summary}</Text>
        <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Esperienza</Text>
        {displayData.experience.map((exp: any, i: number) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 9.5 }}>{exp.position}</Text>
            <Text style={{ fontSize: 8, color: '#666', marginBottom: 2 }}>{exp.company} | {exp.startDate} - {exp.endDate}</Text>
            <Text style={styles.standardText}>{exp.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {isElite ? <EliteTemplate /> : (isSlate ? <TwoColumnLayout /> : <TwoColumnLayout />)}
      </Page>
    </Document>
  );
}
