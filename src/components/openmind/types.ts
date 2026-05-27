export type UserType = 'patient' | 'psychologist' | 'admin' | null;
export type Page =
  | 'home' | 'login' | 'register-patient' | 'register-psychologist'
  | 'dashboard' | 'admin-dashboard' | 'appointments'
  | 'evaluation' | 'messages' | 'schedule' | 'manage-schedule' | 'initial-assessment'
  | 'medical-records' | 'chatbot';
