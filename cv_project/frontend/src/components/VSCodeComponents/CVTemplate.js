import React from 'react';

const CVTemplate = ({ data, theme }) => {
  const { personalInfo, education, workExperience, skills, projects } = data;

  return (
    <div className={`container ${theme}`}>
      <div className="sidebar">
        <img src={personalInfo.photo_url || 'default-profile-pic.jpg'} alt="Photo professionnelle" className="profile-pic" width="150" height="150" />
        <h1>{personalInfo.name}</h1>
        <p>{personalInfo.title}</p>
        <div>
          {skills.map((skill, index) => (
            <span key={index} className="tag">{skill.name}</span>
          ))}
        </div>
        <div className="contact-info">
          <p>📧 <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a></p>
          <p>📱 {personalInfo.phone}</p>
          {personalInfo.linkedin && <p>🔗 <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></p>}
          {personalInfo.github && <p>🐙 <a href={personalInfo.github} target="_blank" rel="noopener noreferrer">GitHub</a></p>}
        </div>
      </div>
      <div className="main-content">
        <h2>// Profil</h2>
        <p>{personalInfo.summary}</p>

        <h2>// Expérience Professionnelle</h2>
        {workExperience.map((exp, index) => (
          <div key={index} className="experience-item">
            <p><span className="company">{exp.company}</span> - {exp.position}</p>
            <p className="date">{exp.start_date} - {exp.end_date || 'Présent'}</p>
            <p>{exp.description}</p>
          </div>
        ))}

        <h2>// Projets</h2>
        {projects.map((project, index) => (
          <div key={index} className="project-item">
            <p><span className="project-title">{project.title}</span></p>
            <p>{project.description}</p>
          </div>
        ))}

        <h2>// Formation</h2>
        {education.map((edu, index) => (
          <p key={index}><strong>{edu.degree}</strong> - {edu.institution}, {edu.end_date}</p>
        ))}

        <h2>// Compétences</h2>
        <div className="code-block">
          <span className="keyword">const</span> skills = {'{'}
          {skills.map((skill, index) => (
            <React.Fragment key={index}>
              <br />
              &nbsp;&nbsp;<span className="string">"{skill.name}"</span>: <span className="number">{skill.level}</span>,
            </React.Fragment>
          ))}
          <br />{'};'}
        </div>
      </div>
    </div>
  );
};

export default CVTemplate;

