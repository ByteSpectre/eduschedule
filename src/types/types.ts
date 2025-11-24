// Core data types for the schedule system

export type LessonType = 'lecture' | 'practice' | 'lab';

export type WeekType = 'odd' | 'even' | 'both';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  order: number;
}

export interface Group {
  id: string;
  name: string;
  course: number;
  faculty: string;
  studentCount: number;
  organizationId: string;
  branchId: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  department: string;
  preferences?: {
    noSaturday?: boolean;
    preferredTimes?: string[];
  };
}

export interface Room {
  id: string;
  number: string;
  building: string;
  capacity: number;
  type: 'lecture' | 'computer' | 'laboratory' | 'regular';
}

export interface Subject {
  id: string;
  name: string;
  hours: number;
}

export interface Lesson {
  id: string;
  subjectId: string;
  subject?: Subject;
  teacherId: string;
  teacher?: Teacher;
  groupId: string;
  group?: Group;
  roomId: string;
  room?: Room;
  type: LessonType;
  dayOfWeek: DayOfWeek;
  timeSlotId: string;
  timeSlot?: TimeSlot;
  weekType: WeekType;
}

export interface Schedule {
  id: string;
  semesterId: string;
  lessons: Lesson[];
}

export interface Conflict {
  id: string;
  type: 'teacher' | 'room' | 'group';
  lessonIds: string[];
  message: string;
  severity: 'error' | 'warning';
}

// Organization & Branch Management
export type OrganizationType = 'university' | 'college' | 'school';

export interface Organization {
  id: string;
  name: string;
  email: string;
  type: OrganizationType;
  city: string;
  createdAt: Date;
  isActive: boolean;
  subscriptionEndDate?: Date;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  address: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'org_admin' | 'editor' | 'viewer';
  organizationId?: string; // null for super_admin
  branchId?: string;
}

export interface Theme {
  mode: 'light' | 'dark';
}

export interface Settings {
  timeSlots: TimeSlot[];
  saturdayTimeSlots?: TimeSlot[];
  theme: Theme;
  notifications: boolean;
}

export interface RoomUtilization {
  roomId: string;
  room: Room;
  totalSlots: number;
  occupiedSlots: number;
  utilizationPercentage: number;
}

export interface TeacherWorkload {
  teacherId: string;
  teacher: Teacher;
  hoursPerWeek: number;
  lessonsCount: number;
}

