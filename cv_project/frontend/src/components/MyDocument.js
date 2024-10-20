import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Créer les styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    margin: 12,
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: 'justify',
  },
});

// Créer le composant Document
const MyDocument = ({ personalInfo, education, workExperience, skills, projects }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>{personalInfo?.name}</Text>
        <Text style={styles.text}>{personalInfo?.email} | {personalInfo?.phone}</Text>
        <Text style={styles.text}>{personalInfo?.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Expériences Professionnelles</Text>
        {workExperience.map((exp, index) => (
          <Text key={index} style={styles.text}>
            {exp.position} - {exp.company} ({exp.start_date} - {exp.end_date || 'Présent'})
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Formation</Text>
        {education.map((edu, index) => (
          <Text key={index} style={styles.text}>
            {edu.institution} ({edu.start_date} - {edu.end_date})
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Compétences</Text>
        <Text style={styles.text}>
          {skills.map(skill => skill.name).join(', ')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Projets</Text>
        {projects.map((project, index) => (
          <Text key={index} style={styles.text}>
            {project.title}: {project.description}
          </Text>
        ))}
      </View>
    </Page>
  </Document>
);

export default MyDocument;
