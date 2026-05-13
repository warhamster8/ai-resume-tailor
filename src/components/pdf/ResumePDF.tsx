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
    page: {
      padding: isElite ? 0 : 0,
      fontFamily: 'Helvetica',
      fontSize: 9,
      lineHeight: 1.4,
      color: '#333',
    },
    // --- STILI ELITE PORTFOLIO (ID 7) ---
    eliteContainer: { padding: 40 },
    eliteHeader: { marginBottom: 20 },
    eliteName: { fontSize: 32, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', color: '#1a1a1a' },
    eliteSubName: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#666', marginTop: 5 },
    eliteLine: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    eliteContactRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 20 },
    eliteContactItem: { fontSize: 8, color: '#444' },
    eliteVerticalLine: { width: 1, height: 10, backgroundColor: '#ccc' },
    eliteProfileBox: { backgroundColor: '#2d2d2d', padding: 25, color: '#fff', marginBottom: 30 },
    eliteProfileTitle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, color: '#fff' },
    eliteBody: { flexDirection: 'row', gap: 40 },
    eliteLeftCol: { width: '35%' },
    eliteRightCol: { width: '65%' },
    eliteSectionTitle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 5, marginBottom: 15, color: '#1a1a1a' },
    eliteSkillRow: { marginBottom: 12 },
    eliteProgressBar: { height: 3, backgroundColor: '#eee', marginTop: 4, position: 'relative' },
    eliteProgressFill: { height: 3, backgroundColor: '#333', position: 'absolute', left: 0, top: 0 },
    eliteExpItem: { marginBottom: 20 },
    eliteExpPos: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: '#1a1a1a' },
    eliteExpComp: { fontSize: 9, fontStyle: 'italic', color: '#666', marginBottom: 5 },
    eliteGdpr: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 7, color: '#999', fontStyle: 'italic' },
    // ------------------------------------
    
    container: { flexDirection: 'row', height: '100%' },
    sidebar: { width: '32%', backgroundColor: isBlue ? '#1d4ed8' : isEmerald ? '#064e3b' : '#fff', padding: 20, color: (isBlue || isEmerald) ? '#fff' : '#333' },
    main: { width: '68%', padding: 30, backgroundColor: '#fff' },
    name: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    contactText: { fontSize: 7.5, marginBottom: 3, opacity: 0.9 },
    sectionTitle: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: isBlue ? '#1d4ed8' : isEmerald ? '#064e3b' : '#333', marginBottom: 10, marginTop: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 4 },
  });

  const EliteTemplate = () => (
    <Page size="A4" style={styles.page}>
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
          <Text style={{ fontSize: 8.5, lineHeight: 1.5 }}>{displayData.personalInfo.summary}</Text>
        </View>

        <View style={styles.eliteBody}>
          <View style={styles.eliteLeftCol}>
            <Text style={styles.eliteSectionTitle}>Istruzione</Text>
            {displayData.education?.map((edu: any, i: number) => (
              <View key={i} style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' }}>{edu.degree}</Text>
                <Text style={{ fontSize: 8, color: '#666' }}>{edu.school}</Text>
                <Text style={{ fontSize: 7, color: '#999' }}>{edu.startDate} - {edu.endDate}</Text>
              </View>
            ))}

            <Text style={[styles.eliteSectionTitle, { marginTop: 20 }]}>Skills</Text>
            {displayData.skills.map((s, i) => (
              <View key={i} style={styles.eliteSkillRow}>
                <Text style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' }}>{s.name}</Text>
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
                  <Text style={{ fontSize: 8, color: '#999' }}>{exp.startDate} - {exp.current ? 'Oggi' : exp.endDate}</Text>
                </View>
                <Text style={styles.eliteExpComp}>{exp.company}</Text>
                <Text style={{ fontSize: 8.5, color: '#444', textAlign: 'justify' }}>{exp.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.eliteGdpr}>Autorizzo il trattamento dei dati personali contenuti nel mio CV in base all'art. 13 D. Lgs. 196/2003 e all'art. 13 GDPR 679/16.</Text>
      </View>
    </Page>
  );

  const StandardTwoColumn = () => (
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        <View style={styles.sidebar}>
          <Text style={styles.name}>{displayData.personalInfo.fullName}</Text>
          <Text style={styles.contactText}>{displayData.personalInfo.email}</Text>
          <Text style={styles.contactText}>{displayData.personalInfo.phone}</Text>
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: 9, marginBottom: 10 }}>Competenze</Text>
            {displayData.skills.map((s, i) => (
              <View key={i} style={{ marginBottom: 5 }}><Text style={{ fontSize: 8.5 }}>{s.name}</Text></View>
            ))}
          </View>
        </View>
        <View style={styles.main}>
          <Text style={styles.sectionTitle}>Profilo</Text>
          <Text style={{ fontSize: 8.5 }}>{displayData.personalInfo.summary}</Text>
          <Text style={styles.sectionTitle}>Esperienza</Text>
          {displayData.experience.map((exp: any, i: number) => (
            <View key={i} style={{ marginBottom: 15 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{exp.position}</Text>
              <Text style={{ fontSize: 8.5, color: '#666' }}>{exp.company} | {exp.startDate} - {exp.endDate}</Text>
              <Text style={{ fontSize: 8.5, marginTop: 3 }}>{exp.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  );

  return (
    <Document>
      {isElite ? <EliteTemplate /> : (isSlate ? <StandardTwoColumn /> /* Placeholder */ : <StandardTwoColumn />)}
    </Document>
  );
}
