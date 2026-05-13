'use client';

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { OptimizedResumeData } from '@/types/resume';

interface Props {
  data: OptimizedResumeData;
  templateId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 0 – Classico (testo originale, layout pulito)
// TEMPLATE 1 – Classico (testo IA, layout pulito)
// TEMPLATE 2 – Modern Blue (testo IA, due colonne leggere)
// TEMPLATE 3 – ATS Minimal (testo IA, massima leggibilità per scanner)
// ─────────────────────────────────────────────────────────────────────────────

export default function ResumePDF({ data, templateId }: Props) {

  const useOriginalText = templateId === 0;
  const useTwoCols = templateId === 2;
  const isATS = templateId === 3;

  // Scelta testo: 0 = originale, tutto il resto = ottimizzato IA
  const pi = useOriginalText ? {
    ...data.personalInfo,
    summary: (data.personalInfo as any)._metadata?.original ?? data.personalInfo.summary,
  } : data.personalInfo;

  const experience = useOriginalText
    ? data.experience.map((exp: any) => ({
        ...exp,
        position: exp._metadata?.originalPosition ?? exp.position,
        description: exp._metadata?.originalDescription ?? exp.description,
      }))
    : data.experience;

  // Palette colori per template
  const accent = useTwoCols ? '#1d4ed8' : isATS ? '#000000' : '#1a1a1a';
  const accentLight = useTwoCols ? '#eff6ff' : '#f5f5f5';

  // ── Stili condivisi ──────────────────────────────────────────────────────
  const s = StyleSheet.create({

    page: {
      fontFamily: 'Helvetica',
      fontSize: 9,
      color: '#1a1a1a',
      backgroundColor: '#ffffff',
    },

    // Layout classico (template 0, 1, 3)
    body: {
      padding: 48,
    },

    // ── Header ──────────────────────────────────────────────────────────────
    headerClassic: {
      marginBottom: 18,
      paddingBottom: 12,
      borderBottomWidth: 1.5,
      borderBottomColor: accent,
    },
    headerATS: {
      marginBottom: 14,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#000',
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 5,
    },
    nameATS: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000000',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    contactText: {
      fontSize: 8.5,
      color: '#555555',
    },
    separator: {
      fontSize: 8.5,
      color: '#aaaaaa',
    },

    // ── Sezioni ─────────────────────────────────────────────────────────────
    section: {
      marginTop: 16,
    },
    sectionTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: accent,
      marginBottom: 8,
      paddingBottom: 3,
      borderBottomWidth: 0.75,
      borderBottomColor: accent,
    },
    sectionTitleATS: {
      fontSize: 9,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: '#000000',
      marginBottom: 6,
      paddingBottom: 2,
      borderBottomWidth: 1,
      borderBottomColor: '#cccccc',
    },

    // ── Esperienza ──────────────────────────────────────────────────────────
    expItem: {
      marginBottom: 12,
    },
    expTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 1,
    },
    expCompany: {
      fontSize: 9.5,
      fontWeight: 'bold',
      color: '#000000',
      maxWidth: '70%',
    },
    expDate: {
      fontSize: 8,
      color: '#777777',
    },
    expPosition: {
      fontSize: 9,
      fontStyle: 'italic',
      color: '#333333',
      marginBottom: 4,
    },
    expDesc: {
      fontSize: 8.5,
      color: '#444444',
      lineHeight: 1.45,
    },

    // ── Skills ──────────────────────────────────────────────────────────────
    skillsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    skillChip: {
      backgroundColor: accentLight,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 3,
    },
    skillText: {
      fontSize: 8,
      color: accent === '#000000' ? '#333333' : accent,
    },

    // ── Education ───────────────────────────────────────────────────────────
    eduItem: {
      marginBottom: 8,
    },
    eduTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 1,
    },
    eduSchool: {
      fontSize: 9.5,
      fontWeight: 'bold',
      color: '#000000',
    },
    eduDate: {
      fontSize: 8,
      color: '#777777',
    },
    eduDegree: {
      fontSize: 9,
      color: '#444444',
    },

    // ── Two-column layout (template 2) ───────────────────────────────────────
    twoColPage: {
      flexDirection: 'row',
    },
    sidebar: {
      width: '30%',
      backgroundColor: '#1d4ed8',
      padding: 24,
      minHeight: '100%',
    },
    main: {
      width: '70%',
      padding: 32,
    },
    sidebarName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 6,
    },
    sidebarSectionTitle: {
      fontSize: 7.5,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: '#93c5fd',
      marginBottom: 8,
      marginTop: 18,
      paddingBottom: 2,
      borderBottomWidth: 0.5,
      borderBottomColor: '#3b82f6',
    },
    sidebarText: {
      fontSize: 8,
      color: '#e0e7ff',
      marginBottom: 5,
      lineHeight: 1.4,
    },
    sidebarSkillName: {
      fontSize: 8.5,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 1,
    },
    sidebarSkillLevel: {
      fontSize: 7.5,
      color: '#93c5fd',
      marginBottom: 6,
    },
    mainSectionTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: '#1d4ed8',
      marginBottom: 10,
      paddingBottom: 3,
      borderBottomWidth: 1,
      borderBottomColor: '#bfdbfe',
    },
    mainSection: {
      marginTop: 18,
    },
  });

  // ── Template Classico (0 e 1) ──────────────────────────────────────────────
  const ClassicTemplate = () => (
    <Page size="A4" style={s.page} wrap>
      <View style={s.body}>
        {/* Header */}
        <View style={s.headerClassic} wrap={false}>
          <Text style={s.name}>{pi.fullName}</Text>
          <View style={s.contactRow}>
            <Text style={s.contactText}>{pi.email}</Text>
            <Text style={s.separator}>  •  </Text>
            <Text style={s.contactText}>{pi.phone}</Text>
            <Text style={s.separator}>  •  </Text>
            <Text style={s.contactText}>{pi.location}</Text>
          </View>
        </View>

        {/* Sommario */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Profilo</Text>
          <Text style={s.expDesc}>{pi.summary}</Text>
        </View>

        {/* Esperienza */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Esperienza Professionale</Text>
          {experience.map((exp: any, i: number) => (
            <View key={i} style={s.expItem} wrap={false}>
              <View style={s.expTopRow}>
                <Text style={s.expCompany}>{exp.company}</Text>
                <Text style={s.expDate}>{exp.startDate} — {exp.current ? 'Presente' : exp.endDate}</Text>
              </View>
              <Text style={s.expPosition}>{exp.position}</Text>
              <Text style={s.expDesc}>{exp.description}</Text>
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>Competenze</Text>
          <View style={s.skillsGrid}>
            {data.skills.map((skill: any, i: number) => (
              <View key={i} style={s.skillChip}>
                <Text style={s.skillText}>{skill.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Formazione */}
        {data.education && data.education.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Formazione</Text>
            {data.education.map((edu: any, i: number) => (
              <View key={i} style={s.eduItem} wrap={false}>
                <View style={s.eduTopRow}>
                  <Text style={s.eduSchool}>{edu.school}</Text>
                  <Text style={s.eduDate}>{edu.startDate} — {edu.endDate}</Text>
                </View>
                <Text style={s.eduDegree}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  );

  // ── Template ATS (3) ───────────────────────────────────────────────────────
  const ATSTemplate = () => (
    <Page size="A4" style={s.page} wrap>
      <View style={s.body}>
        <View style={s.headerATS} wrap={false}>
          <Text style={s.nameATS}>{pi.fullName}</Text>
          <View style={s.contactRow}>
            <Text style={s.contactText}>{pi.email}</Text>
            <Text style={s.separator}>  |  </Text>
            <Text style={s.contactText}>{pi.phone}</Text>
            <Text style={s.separator}>  |  </Text>
            <Text style={s.contactText}>{pi.location}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitleATS}>Summary</Text>
          <Text style={s.expDesc}>{pi.summary}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitleATS}>Professional Experience</Text>
          {experience.map((exp: any, i: number) => (
            <View key={i} style={s.expItem} wrap={false}>
              <View style={s.expTopRow}>
                <Text style={s.expCompany}>{exp.company}</Text>
                <Text style={s.expDate}>{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</Text>
              </View>
              <Text style={s.expPosition}>{exp.position}</Text>
              <Text style={s.expDesc}>{exp.description}</Text>
            </View>
          ))}
        </View>

        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitleATS}>Skills</Text>
          <Text style={s.expDesc}>{data.skills.map((sk: any) => sk.name).join('  •  ')}</Text>
        </View>

        {data.education && data.education.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitleATS}>Education</Text>
            {data.education.map((edu: any, i: number) => (
              <View key={i} style={s.eduItem} wrap={false}>
                <View style={s.eduTopRow}>
                  <Text style={s.eduSchool}>{edu.school}</Text>
                  <Text style={s.eduDate}>{edu.startDate} — {edu.endDate}</Text>
                </View>
                <Text style={s.eduDegree}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  );

  // ── Template Modern Blue due colonne (2) ────────────────────────────────────
  const TwoColTemplate = () => (
    <Page size="A4" style={[s.page, { padding: 0 }]} wrap>
      <View style={s.twoColPage}>
        {/* Sidebar */}
        <View style={s.sidebar}>
          <Text style={s.sidebarName}>{pi.fullName}</Text>
          <Text style={s.sidebarText}>{pi.email}</Text>
          <Text style={s.sidebarText}>{pi.phone}</Text>
          <Text style={s.sidebarText}>{pi.location}</Text>

          <Text style={s.sidebarSectionTitle}>Competenze</Text>
          {data.skills.map((skill: any, i: number) => (
            <View key={i}>
              <Text style={s.sidebarSkillName}>{skill.name}</Text>
              <Text style={s.sidebarSkillLevel}>{skill.level}</Text>
            </View>
          ))}

          {data.education && data.education.length > 0 && (
            <>
              <Text style={s.sidebarSectionTitle}>Formazione</Text>
              {data.education.map((edu: any, i: number) => (
                <View key={i} style={{ marginBottom: 10 }}>
                  <Text style={s.sidebarSkillName}>{edu.degree}</Text>
                  <Text style={s.sidebarText}>{edu.school}</Text>
                  <Text style={s.sidebarSkillLevel}>{edu.startDate} — {edu.endDate}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Main */}
        <View style={s.main}>
          <View style={{ marginBottom: 8 }}>
            <Text style={s.mainSectionTitle} render={() => 'Profilo'} />
            <Text style={s.expDesc}>{pi.summary}</Text>
          </View>

          <View style={s.mainSection}>
            <Text style={s.mainSectionTitle}>Esperienza Professionale</Text>
            {experience.map((exp: any, i: number) => (
              <View key={i} style={s.expItem} wrap={false}>
                <View style={s.expTopRow}>
                  <Text style={s.expCompany}>{exp.company}</Text>
                  <Text style={s.expDate}>{exp.startDate} — {exp.current ? 'Presente' : exp.endDate}</Text>
                </View>
                <Text style={s.expPosition}>{exp.position}</Text>
                <Text style={s.expDesc}>{exp.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Page>
  );

  return (
    <Document>
      {isATS ? <ATSTemplate /> : useTwoCols ? <TwoColTemplate /> : <ClassicTemplate />}
    </Document>
  );
}
