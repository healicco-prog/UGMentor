import React, { useState, useEffect } from 'react';
import CurriculumSetup from './creator/CurriculumSetup';
import LmsNotesStructure from './creator/LmsNotesStructure';
import GenerationEngine from './creator/GenerationEngine';

const TABS = ['Curriculum Setup', 'LMS Notes Structure', 'Generation Engine'];

const COURSE_DATA: Record<string, { subjects: string[]; versions: string[] }> = {
  MBBS: {
    subjects: [
      'Anaesthesia', 'Anatomy', 'Anesthesia', 'Biochemistry', 'Community Medicine (PSM)',
      'Dermatology', 'ENT (Otorhinolaryngology)', 'Emergency Medicine',
      'Forensic Medicine & Toxicology (FMT)', 'General Medicine', 'General Surgery',
      'Microbiology', 'Obstetrics & Gynaecology (OBG)', 'Ophthalmology',
      'Orthopaedics', 'Paediatrics', 'Pathology', 'Pharmacology',
      'Physiology', 'Psychiatry', 'Radiology'
    ],
    versions: ['Standard Curriculum', '2026'],
  },
  BDS: {
    subjects: [
      'Aesthetic Dentistry', 'Behavioural Sciences', 'Biochemistry, Nutrition and Dietetics',
      'Cariology', 'Conservative Dentistry and Endodontics', 'Dental Anatomy, Embryology and Oral Histology',
      'Dental Armamentarium and Usage', 'Dental Materials', 'Diagnosis & Treatment Planning',
      'Ethics', 'Forensic Odontology', 'General Human Anatomy including Embryology, Osteology & Histology',
      'General Medicine', 'General Pathology', 'General Physiology', 'General Surgery',
      'General and Dental Pharmacology and Therapeutics', 'Implantology', 'Microbiology',
      'Oral & Maxillofacial Surgery', 'Oral Medicine and Radiology', 'Oral and Maxillofacial Pathology & Oral Microbiology',
      'Orthodontics & Dentofacial Orthopaedics', 'Pediatric and Preventive Dentistry', 'Periodontology',
      'Preclinical Conservative Dentistry', 'Preclinical Prosthodontics and Crown & Bridge',
      'Prosthodontics and Crown & Bridge', 'Public Health Dentistry', 'Pulpoperiapical Lesions',
      'Sterilization & Disinfection'
    ],
    versions: ['Standard Curriculum', '2026'],
  },
  'BSc Nursing': {
    subjects: [
      'Adult Health Nursing (Medical Surgical Nursing) I', 'Adult Health Nursing II',
      'Applied Anatomy', 'Applied Biochemistry', 'Applied Microbiology & Infection Control including Safety',
      'Applied Nutrition & Dietetics', 'Applied Physiology', 'Applied Psychology',
      'Applied Sociology', 'Child Health Nursing I & II', 'Community Health Nursing I & II',
      'Educational Technology / Nursing Education', 'Genetics', 'Mental Health Nursing I & II',
      'Midwifery / OBG Nursing I & II', 'Nursing Foundations I', 'Nursing Foundations II',
      'Nursing Management & Leadership', 'Nursing Research & Statistics', 'Pathology I & II',
      'Pharmacology I & II'
    ],
    versions: ['2026'],
  },
};
const INITIAL_COURSES = Object.keys(COURSE_DATA);

export default function AdminCreator() {
  const [activeTab, setActiveTab] = useState('Curriculum Setup');

  // Shared state lifted up so all tabs stay in sync
  const [course, setCourse] = useState('All Courses');
  const [subject, setSubject] = useState('All Subjects');
  const [section, setSection] = useState('All Sections');
  const [courses, setCourses] = useState<string[]>(['All Courses', ...INITIAL_COURSES]);
  const [subjects, setSubjects] = useState<string[]>(['All Subjects', ...COURSE_DATA['MBBS'].subjects]);
  const [sections, setSections] = useState<string[]>(['All Sections']);

  const [version, setVersion] = useState('All Versions');

  // Fetch courses once on mount
  useEffect(() => {
    import('@/lib/supabase').then(({ supabase, fetchAllRows }) => {
      const buildQuery = () => supabase.from('lms_content').select('course').neq('course', 'Blog');
      fetchAllRows(buildQuery).then((data) => {
        if (data) {
          const u = [...new Set(data.map((d: any) => d.course).filter(Boolean))] as string[];
          setCourses(prev => ['All Courses', ...new Set([...prev.filter(c => c !== 'All Courses'), ...u])].sort((a, b) => a === 'All Courses' ? -1 : b === 'All Courses' ? 1 : a.localeCompare(b)));
        }
      });
    });
  }, []);

  // Sync subjects when course changes
  useEffect(() => {
    import('@/lib/supabase').then(({ supabase, fetchAllRows }) => {
      const buildQuery = () => {
        let q = supabase.from('lms_content').select('subject');
        if (course !== 'All Courses') q = q.eq('course', course);
        return q;
      };
      
      fetchAllRows(buildQuery).then((data) => {
        if (data) {
          const u = [...new Set(data.map((d: any) => d.subject).filter(Boolean))] as string[];
          setSubjects(prev => {
            const hardcoded = course !== 'All Courses' ? (COURSE_DATA[course]?.subjects || []) : [];
            const merged = ['All Subjects', ...new Set([...hardcoded, ...u])].sort((a, b) => a === 'All Subjects' ? -1 : b === 'All Subjects' ? 1 : a.localeCompare(b));
            if (merged.length > 0 && !merged.includes(subject)) {
              setSubject(merged[0]);
            }
            return merged;
          });
        }
      });
      
      const newVersions = course !== 'All Courses' ? (COURSE_DATA[course]?.versions || ['2026']) : ['All Versions', '2026', 'Standard Curriculum'];
      if (!newVersions.includes(version)) {
        setVersion(newVersions[0]);
      }
    });
  }, [course]);

  // Sync sections when course or subject changes
  useEffect(() => {
    import('@/lib/supabase').then(({ supabase, fetchAllRows }) => {
      const buildQuery = () => {
        let q = supabase.from('lms_content').select('section');
        if (course !== 'All Courses') q = q.eq('course', course);
        if (subject !== 'All Subjects') q = q.eq('subject', subject);
        return q;
      };
      
      fetchAllRows(buildQuery).then((data) => {
        if (data) {
          const u = [...new Set(data.map((d: any) => d.section).filter(Boolean))].sort() as string[];
          const merged = ['All Sections', ...u];
          setSections(merged);
          if (!merged.includes(section)) setSection(merged[0]);
        }
      });
    });
  }, [course, subject]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', color: '#0f172a' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Content Creator Intelligence</h1>
        <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>Mass trigger Gemini background jobs and build your curriculum.</p>
      </div>

      {/* Tab strip */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 999, padding: 4, gap: 4 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 22px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
              background: activeTab === tab ? '#fff' : 'transparent',
              color: activeTab === tab ? '#0f172a' : '#64748b',
              boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'Curriculum Setup' && (
        <CurriculumSetup
          course={course} setCourse={setCourse}
          subject={subject} setSubject={setSubject}
          section={section} setSection={setSection}
          courses={courses} setCourses={setCourses}
          subjects={subjects} setSubjects={setSubjects}
          sections={sections} setSections={setSections}
        />
      )}
      {activeTab === 'LMS Notes Structure' && (
        <LmsNotesStructure
          course={course} subject={subject} section={section}
          courses={courses} subjects={subjects} sections={sections}
        />
      )}
      {activeTab === 'Generation Engine' && (
        <GenerationEngine
          course={course} setCourse={setCourse}
          subject={subject} setSubject={setSubject}
          section={section} setSection={setSection} sections={sections}
          courses={courses} subjects={subjects}
          version={version} setVersion={setVersion}
          versions={COURSE_DATA[course]?.versions || ['2026']}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}
