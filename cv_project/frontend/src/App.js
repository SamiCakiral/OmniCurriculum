import React from 'react';
import PersonalInfo from './components/PersonalInfo';
import Education from './components/Education';
import WorkExperience from './components/WorkExperience';
import Skills from './components/Skills';
import Projects from './components/Projects';

function App() {
  return (
    <div className="App">
      <h1>CV de Sami Cakiral</h1>
      <PersonalInfo />
      <Education />
      <WorkExperience />
      <Skills />
      <Projects />
    </div>
  );
}

export default App;