'use client';

import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { OptimizedResumeData } from '@/types/resume';

// Font registration (optional, using default Helvetica/Times-Roman for now)

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0070f3',
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  contact: {
    flexDirection: 'row',
    gap: 10,
    color: '#666',
    fontSize: 9,
  },
  section: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#0070f3',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 2,
  },
  experienceItem: {
    marginBottom: 10,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  company: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  position: {
    fontStyle: 'italic',
    color: '#444',
  },
  date: {
    color: '#888',
    fontSize: 9,
  },
  description: {
    marginTop: 3,
    textAlign: 'justify',
  },
  bullet: {
    marginLeft: 10,
    marginTop: 2,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  skillBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  }
});

interface Props {
  data: OptimizedResumeData;
  templateId: number;
}

export default function ResumePDF({ data, templateId }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.personalInfo.fullName}</Text>
          <View style={styles.contact}>
            <Text>{data.personalInfo.email}</Text>
            <Text>|</Text>
            <Text>{data.personalInfo.phone}</Text>
            <Text>|</Text>
            <Text>{data.personalInfo.location}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Riepilogo Professionale</Text>
          <Text style={styles.description}>{data.personalInfo.summary}</Text>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Esperienza Lavorativa</Text>
          {data.experience.map((exp, i) => (
            <View key={i} style={styles.experienceItem}>
              <View style={styles.expHeader}>
                <Text style={styles.company}>{exp.company}</Text>
                <Text style={styles.date}>{exp.startDate} - {exp.current ? 'Presente' : exp.endDate}</Text>
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
                <Text>{skill.name} ({skill.level})</Text>
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
                <Text style={styles.date}>{edu.startDate} - {edu.endDate}</Text>
              </View>
              <Text style={styles.position}>{edu.degree} in {edu.field}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
