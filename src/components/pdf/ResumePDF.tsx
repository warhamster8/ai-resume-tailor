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

  const colors = {
    blue: { primary: '#1d4ed8', secondary: '#eff6ff', text: '#1e3a8a', sidebar: '#1d4ed8' },
    emerald: { primary: '#064e3b', secondary: '#ecfdf5', text: '#064e3b', sidebar: '#064e3b' },
    slate: { primary: '#334155', secondary: '#f1f5f9', text: '#1e293b', sidebar: '#f8fafc' },
    classic: { primary: '#1a1a1a', secondary: '#f5f5f5', text: '#111', sidebar: '#fff' }
  };

  const theme = isBlue ? colors.blue : isEmerald ? colors.emerald : isSlate ? colors.slate : colors.classic;

  const styles = StyleSheet.create({
    page: {
      padding: isSlate ? 0 : 0, // Gestiamo il padding internamente per coerenza
      fontFamily: 'Helvetica',
      fontSize: 9,
      lineHeight: 1.4,
      color: '#333',
    },
    container: { flexDirection: 'row', height: '100%' },
    sidebar: {
      width: '32%',
      backgroundColor: theme.sidebar,
      padding: 20,
      color: (isBlue || isEmerald) ? '#fff' : '#333',
    },
    main: {
      width: '68%',
      padding: 30,
      backgroundColor: '#fff',
    },
    sidebarHeader: {
      marginBottom: 25,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.2)',
      paddingBottom: 15,
    },
    name: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    contactText: {
      fontSize: 7.5,
      marginBottom: 3,
      opacity: 0.9,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: theme.primary,
      marginBottom: 10,
      marginTop: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.secondary,
      paddingBottom: 4,
    },
    sidebarTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: 20,
      marginBottom: 10,
      color: (isBlue || isEmerald) ? '#fff' : theme.primary,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.2)',
      paddingBottom: 3,
    },
    expItem: { marginBottom: 15 },
    expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    company: { fontWeight: 'bold', fontSize: 10, color: '#111' },
    position: { fontStyle: 'italic', fontWeight: 'bold', color: theme.primary, fontSize: 9.5 },
    date: { fontSize: 8, color: '#666' },
    desc: { fontSize: 8.5, textAlign: 'justify', marginTop: 4, lineHeight: 1.3 },
    skillItem: {
      marginBottom: 8,
    },
    skillName: {
      fontSize: 8.5,
      fontWeight: 'bold',
    },
    skillLevel: {
      fontSize: 7,
      opacity: 0.8,
    }
  });

  const TwoColumnLayout = () => (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.name}>{displayData.personalInfo.fullName}</Text>
          <Text style={styles.contactText}>{displayData.personalInfo.email}</Text>
          <Text style={styles.contactText}>{displayData.personalInfo.phone}</Text>
          <Text style={styles.contactText}>{displayData.personalInfo.location}</Text>
        </View>
        
        <Text style={styles.sidebarTitle}>Competenze</Text>
        {displayData.skills.map((s, i) => (
          <View key={i} style={styles.skillItem}>
            <Text style={styles.skillName}>{s.name}</Text>
            <Text style={styles.skillLevel}>{s.level}</Text>
          </View>
        ))}

        {displayData.education && (
          <View>
            <Text style={styles.sidebarTitle}>Istruzione</Text>
            {displayData.education.map((edu: any, i: number) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 8.5 }}>{edu.degree}</Text>
                <Text style={{ fontSize: 7.5, opacity: 0.8 }}>{edu.school}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.main}>
        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Profilo Professionale</Text>
        <Text style={styles.desc}>{displayData.personalInfo.summary}</Text>
        
        <Text style={styles.sectionTitle}>Esperienza Lavorativa</Text>
        {displayData.experience.map((exp: any, i: number) => (
          <View key={i} style={styles.expItem}>
            <View style={styles.expHeader}>
              <Text style={styles.company}>{exp.company}</Text>
              <Text style={styles.date}>{exp.startDate} - {exp.current ? 'Presente' : exp.endDate}</Text>
            </View>
            <Text style={styles.position}>{exp.position}</Text>
            <Text style={styles.desc}>{exp.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Layout Slate (Modern Full Width)
  const SlateLayout = () => (
    <View>
      <View style={{ backgroundColor: theme.primary, padding: 30, color: '#fff' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 5 }}>{displayData.personalInfo.fullName}</Text>
        <Text style={{ fontSize: 9, opacity: 0.9 }}>{displayData.personalInfo.email} • {displayData.personalInfo.phone} • {displayData.personalInfo.location}</Text>
      </View>
      <View style={{ padding: 30 }}>
        <Text style={styles.sectionTitle}>Profilo Professionale</Text>
        <Text style={styles.desc}>{displayData.personalInfo.summary}</Text>

        <Text style={styles.sectionTitle}>Esperienza Lavorativa</Text>
        {displayData.experience.map((exp: any, i: number) => (
          <View key={i} style={styles.expItem}>
            <View style={styles.expHeader}>
              <Text style={styles.company}>{exp.company}</Text>
              <Text style={styles.date}>{exp.startDate} - {exp.current ? 'Presente' : exp.endDate}</Text>
            </View>
            <Text style={styles.position}>{exp.position}</Text>
            <Text style={styles.desc}>{exp.description}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Competenze & Skill</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
          {displayData.skills.map((s, i) => (
            <Text key={i} style={{ 
              fontSize: 8, padding: '3 8', backgroundColor: theme.secondary, 
              color: theme.primary, borderRadius: 4, marginRight: 5, marginBottom: 5 
            }}>{s.name} ({s.level})</Text>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {isSlate ? <SlateLayout /> : <TwoColumnLayout />}
      </Page>
    </Document>
  );
}
