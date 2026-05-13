'use client';

import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { OptimizedResumeData } from '@/types/resume';

// Configuriamo i colori dei template
const themeColors = {
  1: '#0070f3', // Professional (Blue)
  2: '#333333', // Minimal (Black)
  3: '#e91e63', // Creative (Pink)
  4: '#4caf50', // Modern (Green)
  5: '#3f51b5', // Executive (Indigo)
  6: '#00bcd4', // Tech (Cyan)
};

interface Props {
  data: OptimizedResumeData;
  templateId: number;
}

export default function ResumePDF({ data, templateId }: Props) {
  const accentColor = (themeColors as any)[templateId] || themeColors[1];

  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: 'Helvetica',
      fontSize: 10,
      lineHeight: 1.4,
      color: '#333',
      backgroundColor: '#fff',
    },
    header: {
      marginBottom: 25,
      borderBottomWidth: templateId === 2 ? 0 : 2,
      borderBottomColor: accentColor,
      paddingBottom: 15,
      textAlign: templateId === 3 ? 'center' : 'left',
    },
    name: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 5,
      textTransform: templateId === 5 ? 'uppercase' : 'none',
      letterSpacing: templateId === 5 ? 1 : 0,
    },
    contact: {
      flexDirection: 'row',
      justifyContent: templateId === 3 ? 'center' : 'flex-start',
      gap: 12,
      color: '#666',
      fontSize: 9,
    },
    section: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: accentColor,
      marginBottom: 8,
      borderBottomWidth: templateId === 2 ? 1 : 0,
      borderBottomColor: '#eee',
      paddingBottom: 3,
      letterSpacing: 0.5,
    },
    experienceItem: {
      marginBottom: 12,
    },
    expHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 3,
    },
    company: {
      fontWeight: 'bold',
      fontSize: 11,
      color: '#000',
    },
    position: {
      fontStyle: 'italic',
      color: '#444',
      fontSize: 10,
      marginBottom: 4,
    },
    date: {
      color: '#777',
      fontSize: 9,
      fontWeight: 'bold',
    },
    description: {
      marginTop: 4,
      textAlign: 'justify',
      lineHeight: 1.5,
    },
    skillsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 5,
    },
    skillBadge: {
      backgroundColor: templateId === 2 ? '#fff' : '#f5f5f5',
      borderWidth: templateId === 2 ? 1 : 0,
      borderColor: '#ddd',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: templateId === 4 ? 12 : 3,
    },
    skillText: {
      fontSize: 8.5,
      color: '#444',
    }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
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

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profilo</Text>
          <Text style={styles.description}>{data.personalInfo.summary}</Text>
        </View>

        {/* Experience */}
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

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Competenze</Text>
          <View style={styles.skillsGrid}>
            {data.skills.map((skill, i) => (
              <View key={i} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill.name} • {skill.level}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formazione</Text>
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
      </Page>
    </Document>
  );
}
