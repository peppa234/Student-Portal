import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Student, Teacher, Class, Subject } from '../types';

interface DataContextType {
  // Students
  students: Student[];
  studentsLoading: boolean;
  studentsError: string | null;
  setStudents: (students: Student[]) => void;
  setStudentsLoading: (loading: boolean) => void;
  setStudentsError: (error: string | null) => void;

  // Teachers
  teachers: Teacher[];
  teachersLoading: boolean;
  teachersError: string | null;
  setTeachers: (teachers: Teacher[]) => void;
  setTeachersLoading: (loading: boolean) => void;
  setTeachersError: (error: string | null) => void;

  // Classes
  classes: Class[];
  classesLoading: boolean;
  classesError: string | null;
  setClasses: (classes: Class[]) => void;
  setClassesLoading: (loading: boolean) => void;
  setClassesError: (error: string | null) => void;

  // Subjects
  subjects: Subject[];
  subjectsLoading: boolean;
  subjectsError: string | null;
  setSubjects: (subjects: Subject[]) => void;
  setSubjectsLoading: (loading: boolean) => void;
  setSubjectsError: (error: string | null) => void;

  // Clear all errors
  clearAllErrors: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Students state
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  // Teachers state
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState<string | null>(null);

  // Classes state
  const [classes, setClasses] = useState<Class[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  // Subjects state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

  const clearAllErrors = () => {
    setStudentsError(null);
    setTeachersError(null);
    setClassesError(null);
    setSubjectsError(null);
  };

  const value: DataContextType = {
    // Students
    students,
    studentsLoading,
    studentsError,
    setStudents,
    setStudentsLoading,
    setStudentsError,

    // Teachers
    teachers,
    teachersLoading,
    teachersError,
    setTeachers,
    setTeachersLoading,
    setTeachersError,

    // Classes
    classes,
    classesLoading,
    classesError,
    setClasses,
    setClassesLoading,
    setClassesError,

    // Subjects
    subjects,
    subjectsLoading,
    subjectsError,
    setSubjects,
    setSubjectsLoading,
    setSubjectsError,

    clearAllErrors,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
