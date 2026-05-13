'use client';

import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { OptimizedResumeData } from '@/types/resume';

interface Props {
  data: OptimizedResumeData;
  templateId: number;
}

export default function ResumePDF({ data, templateId }: Props) {
  
  // Stili differenziati per Template
  const isATS = templateId === 1;
  const isEuropass = templateId === 2;
  const isExecutive = templateId === 3;

  const styles = StyleSheet.create({
    page: {
      padding: isEuropass ? 0 : 40,
      fontFamily: 'Helvetica',
      fontSize: isATS ? 10.5 : 10,
      lineHeight: 1.5,
      color: '#222',
      backgroundColor: '#fff',
    },
    // Layout Europass (due colonne)
    europassContainer: {
      flexDirection: 'row',
      height: '100%',
    },
    europassSidebar: {
      width: '30%',
      backgroundColor: '#f8f9fa',
      padding: 20,
      borderRightWidth: 1,
      borderRightColor: '#eee',
    },
    europassMain: {
      width: '70%',
      padding: 30,
    },
    // Elementi comuni con variazioni
    header: {
      marginBottom: isExecutive ? 30 : 20,
      textAlign: isExecutive ? 'center' : 'left',
      borderBottomWidth: isATS ? 1 : 0,
      borderBottomColor: '#000',
      paddingBottom: isATS ? 10 : 0,
    },
    name: {
      fontSize: isATS ? 20 : 24,
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
      fontSize: 9,
      marginBottom: 10,
    },
    section: {
      marginTop: 18,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: isEuropass ? '#0056b3' : '#000',
      marginBottom: 10,
      borderBottomWidth: isATS || isExecutive ? 1 : 0,
      borderBottomColor: '#ccc',
      paddingBottom: 2,
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
      fontSize: 11,
    },
    position: {
      fontStyle: 'italic',
      fontWeight: 'bold',
      color: '#333',
    },
    date: {
      fontSize: 9,
      color: '#666',
    },
    description: {
      marginTop: 4,
      textAlign: 'justify',
      fontSize: 9.5,
    },
    skillItem: {
      marginBottom: 5,
      fontSize: 9,
    },
    skillName: {
      fontWeight: 'bold',
    }
  });

  // Render per Template Modern ATS (Harvard) o Executive
  const StandardLayout = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.name}>{data.personalInfo.fullName}</Text>
        <View style={styles.contact}>
          <Text>{data.personalInfo.email}</Text>
          <Text>•</Text>
          <Text>{data.personalInfo.phone}</Text>
          <Text>•</Text>
          <Text>{data.personalInfo.location}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profilo Professionale</Text>
        <Text style={styles.description}>{data.personalInfo.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Esperienza Lavorativa</Text>
        {data.experience.map((exp, i) => (
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
        <Text style={styles.sectionTitle}>Competenze Strategiche</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
          {data.skills.map((skill, i) => (
            <Text key={i} style={styles.skillItem}>
              <Text style={styles.skillName}>{skill.name}</Text> ({skill.level})
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Istruzione</Text>
        {data.education.map((edu, i) => (
          <View key={i} style={styles.experienceItem}>
            <View style={styles.expHeader}>
              <Text style={styles.company}>{edu.school}</Text>
              <Text style={styles.date}>{edu.startDate} — {edu.endDate}</Text>
            </View>
            <Text style={styles.position}>{edu.degree} in {edu.field}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Render per Template Europass
  const EuropassLayout = () => (
    <View style={styles.europassContainer}>
      <View style={styles.europassSidebar}>
        <Text style={[styles.name, { fontSize: 18, marginBottom: 20 }]}>{data.personalInfo.fullName}</Text>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { fontSize: 9 }]}>Contatti</Text>
          <Text style={{ fontSize: 8, marginBottom: 4 }}>{data.personalInfo.email}</Text>
          <Text style={{ fontSize: 8, marginBottom: 4 }}>{data.personalInfo.phone}</Text>
          <Text style={{ fontSize: 8 }}>{data.personalInfo.location}</Text>
        </View>

        <View>
          <Text style={[styles.sectionTitle, { fontSize: 9 }]}>Competenze</Text>
          {data.skills.map((skill, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold' }}>{skill.name}</Text>
              <Text style={{ fontSize: 7, color: '#666' }}>{skill.level}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.europassMain}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Profilo</Text>
          <Text style={styles.description}>{data.personalInfo.summary}</Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Esperienza</Text>
          {data.experience.map((exp, i) => (
            <View key={i} style={styles.experienceItem}>
              <Text style={styles.date}>{exp.startDate} — {exp.current ? 'Presente' : exp.endDate}</Text>
              <Text style={styles.position}>{exp.position}</Text>
              <Text style={styles.company}>{exp.company}</Text>
              <Text style={styles.description}>{exp.description}</Text>
            </View>
          ))}
        </View>

        <View>
          <Text style={styles.sectionTitle}>Istruzione</Text>
          {data.education.map((edu, i) => (
            <View key={i} style={styles.experienceItem}>
              <Text style={styles.date}>{edu.startDate} — {edu.endDate}</Text>
              <Text style={styles.position}>{edu.degree}</Text>
              <Text style={styles.company}>{edu.school}</Text>
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
