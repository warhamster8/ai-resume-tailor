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
    eliteGdpr: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 7.5, color: '#999' },
    
    // --- COMMON STYLES ---
    standardText: { fontSize: 9.5, lineHeight: 1.4, textAlign: 'justify' },
    sidebar: { width: '32%', backgroundColor: isBlue ? '#1d4ed8' : '#064e3b', padding: 20, color: '#fff' },
    main: { width: '68%', padding: 30, backgroundColor: '#fff' },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: isBlue ? '#1d4ed8' : '#064e3b', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
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
            <View key={i} style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{edu.degree}</Text>
              <Text style={{ fontSize: 8.5, color: '#666' }}>{edu.school}</Text>
            </View>
          ))}
          <Text style={[styles.eliteSectionTitle, { marginTop: 25 }]}>Skills</Text>
          {displayData.skills.map((s, i) => (
            <View key={i} style={styles.eliteSkillRow}>
              <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{s.name}</Text>
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
      <Text style={styles.eliteGdpr}>Autorizzo il trattamento dei dati personali (D. Lgs. 196/2003 e GDPR 679/16).</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {isElite ? <EliteTemplate /> : <EliteTemplate /> /* Fallback for now */}
      </Page>
    </Document>
  );
}
