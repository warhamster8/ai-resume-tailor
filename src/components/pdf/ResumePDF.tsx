'use client';

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { OptimizedResumeData } from '@/types/resume';

interface Props {
  data: OptimizedResumeData;
  templateId: number;
}

export default function ResumePDF({ data, templateId }: Props) {
  
  const isOriginal = templateId === 0;
  const isProfessionale = templateId === 1;
  const isEuropass = templateId === 2;
  const isExecutive = templateId === 3;
  const isATS = templateId === 4;

  // Selezione dei dati da visualizzare (Master vs Ottimizzato)
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
      padding: isEuropass ? 0 : (isATS ? 30 : 45),
      fontFamily: 'Helvetica',
      fontSize: isATS ? 9 : 10,
      lineHeight: 1.4,
      color: '#222',
      backgroundColor: '#fff',
    },
    europassContainer: {
      flexDirection: 'row',
      minHeight: '100%',
    },
    europassSidebar: {
      width: '32%',
      backgroundColor: '#f1f4f8',
      padding: 25,
      borderRightWidth: 1,
      borderRightColor: '#d1d9e6',
    },
    europassMain: {
      width: '68%',
      padding: 30,
    },
    header: {
      marginBottom: 20,
      textAlign: isExecutive ? 'center' : 'left',
      borderBottomWidth: isATS ? 1 : 0,
      borderBottomColor: '#000',
      paddingBottom: isATS ? 5 : 0,
    },
    name: {
      fontSize: isATS ? 18 : 24,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 4,
      textTransform: isATS ? 'uppercase' : 'none',
    },
    contact: {
      flexDirection: 'row',
      justifyContent: isExecutive ? 'center' : 'flex-start',
      flexWrap: 'wrap',
      gap: 10,
      color: '#555',
      fontSize: 8.5,
    },
    section: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: isEuropass ? '#004a99' : '#000',
      marginBottom: 8,
      borderBottomWidth: isATS || isExecutive ? 1 : 0,
      borderBottomColor: '#eee',
      paddingBottom: 3,
    },
    experienceItem: {
      marginBottom: 15,
    },
    expHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 2,
    },
    company: {
      fontWeight: 'bold',
      fontSize: 10.5,
      color: '#111',
    },
    position: {
      fontStyle: 'italic',
      fontWeight: 'bold',
      color: '#222',
    },
    date: {
      fontSize: 8.5,
      color: '#666',
    },
    description: {
      marginTop: 4,
      textAlign: 'justify',
      fontSize: 9,
      lineHeight: 1.4,
    }
  });

  const StandardLayout = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.name}>{displayData.personalInfo.fullName}</Text>
        <View style={styles.contact}>
          <Text>{displayData.personalInfo.email}</Text>
          <Text>•</Text>
          <Text>{displayData.personalInfo.phone}</Text>
          <Text>•</Text>
          <Text>{displayData.personalInfo.location}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profilo Professionale</Text>
        <Text style={styles.description}>{displayData.personalInfo.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Esperienza Professionale</Text>
        {displayData.experience.map((exp: any, i: number) => (
          <View key={i} style={styles.experienceItem}>
            <View style={styles.expHeader}>
              <Text style={styles.company}>{exp.company}</Text>
              <Text style={styles.date}>{exp.startDate} — {exp.current ? 'Presente' : exp.endDate}</Text>
            </View>
            <Text style={styles.position}>{exp.position}</Text>
            <Text style={styles.description}>{exp.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Competenze & Skill</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {displayData.skills.map((skill: any, i: number) => (
            <Text key={i} style={{ fontSize: 9 }}>
              <Text style={{ fontWeight: 'bold' }}>{skill.name}</Text> ({skill.level})
            </Text>
          ))}
        </View>
      </View>
    </View>
  );

  const EuropassLayout = () => (
    <View style={styles.europassContainer}>
      <View style={styles.europassSidebar}>
        <Text style={[styles.name, { fontSize: 18, marginBottom: 20 }]}>{displayData.personalInfo.fullName}</Text>
        <Text style={{ fontSize: 8.5, marginBottom: 5 }}>{displayData.personalInfo.email}</Text>
        <Text style={{ fontSize: 8.5, marginBottom: 5 }}>{displayData.personalInfo.phone}</Text>
        <Text style={{ fontSize: 8.5 }}>{displayData.personalInfo.location}</Text>

        <View style={{ marginTop: 25 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#004a99', marginBottom: 10 }}>COMPETENZE</Text>
          {displayData.skills.map((skill: any, i: number) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 8.5, fontWeight: 'bold' }}>{skill.name}</Text>
              <Text style={{ fontSize: 7.5, color: '#666' }}>{skill.level}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.europassMain}>
        <View style={{ marginBottom: 25 }}>
          <Text style={styles.sectionTitle}>Profilo</Text>
          <Text style={styles.description}>{displayData.personalInfo.summary}</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Esperienza</Text>
          {displayData.experience.map((exp: any, i: number) => (
            <View key={i} style={styles.experienceItem}>
              <Text style={[styles.date, { marginBottom: 2 }]}>{exp.startDate} — {exp.current ? 'Presente' : exp.endDate}</Text>
              <Text style={styles.position}>{exp.position}</Text>
              <Text style={[styles.company, { color: '#004a99', marginBottom: 4 }]}>{exp.company}</Text>
              <Text style={styles.description}>{exp.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {isEuropass ? <EuropassLayout /> : <StandardLayout />}
      </Page>
    </Document>
  );
}
