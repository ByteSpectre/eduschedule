import type { Group, Teacher, Room, Subject, TimeSlot, Lesson, DayOfWeek } from '../types/types';

// Time slots (standard university schedule)
export const mockTimeSlots: TimeSlot[] = [
  { id: '1', startTime: '08:30', endTime: '10:00', order: 1 },
  { id: '2', startTime: '10:10', endTime: '11:40', order: 2 },
  { id: '3', startTime: '11:50', endTime: '13:20', order: 3 },
  { id: '4', startTime: '14:00', endTime: '15:30', order: 4 },
  { id: '5', startTime: '15:40', endTime: '17:10', order: 5 },
  { id: '6', startTime: '17:20', endTime: '18:50', order: 6 },
];

// Groups
export const mockGroups: Group[] = [
  { id: 'g1', name: 'ИВТ-401', course: 4, faculty: 'Информатика и вычислительная техника', studentCount: 25 },
  { id: 'g2', name: 'ИВТ-402', course: 4, faculty: 'Информатика и вычислительная техника', studentCount: 23 },
  { id: 'g3', name: 'ИВТ-301', course: 3, faculty: 'Информатика и вычислительная техника', studentCount: 28 },
  { id: 'g4', name: 'ПИ-201', course: 2, faculty: 'Прикладная информатика', studentCount: 30 },
  { id: 'g5', name: 'ПИ-202', course: 2, faculty: 'Прикладная информатика', studentCount: 27 },
];

// Teachers
export const mockTeachers: Teacher[] = [
  { id: 't1', firstName: 'Иван', lastName: 'Петров', middleName: 'Сергеевич', department: 'Кафедра программного обеспечения' },
  { id: 't2', firstName: 'Мария', lastName: 'Иванова', middleName: 'Александровна', department: 'Кафедра прикладной математики' },
  { id: 't3', firstName: 'Алексей', lastName: 'Смирнов', middleName: 'Викторович', department: 'Кафедра информационных систем', preferences: { noSaturday: true } },
  { id: 't4', firstName: 'Елена', lastName: 'Козлова', middleName: 'Петровна', department: 'Кафедра программного обеспечения' },
  { id: 't5', firstName: 'Дмитрий', lastName: 'Волков', middleName: 'Андреевич', department: 'Кафедра баз данных' },
];

// Rooms
export const mockRooms: Room[] = [
  { id: 'r1', number: '101', building: 'Корпус А', capacity: 30, type: 'lecture' },
  { id: 'r2', number: '102', building: 'Корпус А', capacity: 25, type: 'regular' },
  { id: 'r3', number: '201', building: 'Корпус А', capacity: 20, type: 'computer' },
  { id: 'r4', number: '202', building: 'Корпус А', capacity: 15, type: 'laboratory' },
  { id: 'r5', number: '301', building: 'Корпус Б', capacity: 50, type: 'lecture' },
  { id: 'r6', number: '302', building: 'Корпус Б', capacity: 20, type: 'computer' },
];

// Subjects
export const mockSubjects: Subject[] = [
  { id: 's1', name: 'Разработка веб-приложений', hours: 64 },
  { id: 's2', name: 'Базы данных', hours: 48 },
  { id: 's3', name: 'Алгоритмы и структуры данных', hours: 64 },
  { id: 's4', name: 'Операционные системы', hours: 48 },
  { id: 's5', name: 'Компьютерные сети', hours: 48 },
  { id: 's6', name: 'Математический анализ', hours: 64 },
];

// Lessons (sample schedule for group ИВТ-401)
export const mockLessons: Lesson[] = [
  // Monday
  {
    id: 'l1',
    subjectId: 's1',
    teacherId: 't1',
    groupId: 'g1',
    roomId: 'r1',
    type: 'lecture',
    dayOfWeek: 'monday',
    timeSlotId: '1',
    weekType: 'both',
  },
  {
    id: 'l2',
    subjectId: 's1',
    teacherId: 't1',
    groupId: 'g1',
    roomId: 'r3',
    type: 'practice',
    dayOfWeek: 'monday',
    timeSlotId: '2',
    weekType: 'both',
  },
  {
    id: 'l3',
    subjectId: 's2',
    teacherId: 't5',
    groupId: 'g1',
    roomId: 'r1',
    type: 'lecture',
    dayOfWeek: 'monday',
    timeSlotId: '3',
    weekType: 'both',
  },
  // Tuesday
  {
    id: 'l4',
    subjectId: 's3',
    teacherId: 't2',
    groupId: 'g1',
    roomId: 'r5',
    type: 'lecture',
    dayOfWeek: 'tuesday',
    timeSlotId: '1',
    weekType: 'both',
  },
  {
    id: 'l5',
    subjectId: 's3',
    teacherId: 't2',
    groupId: 'g1',
    roomId: 'r2',
    type: 'practice',
    dayOfWeek: 'tuesday',
    timeSlotId: '2',
    weekType: 'both',
  },
  {
    id: 'l6',
    subjectId: 's2',
    teacherId: 't5',
    groupId: 'g1',
    roomId: 'r4',
    type: 'lab',
    dayOfWeek: 'tuesday',
    timeSlotId: '4',
    weekType: 'odd',
  },
  // Wednesday
  {
    id: 'l7',
    subjectId: 's4',
    teacherId: 't3',
    groupId: 'g1',
    roomId: 'r1',
    type: 'lecture',
    dayOfWeek: 'wednesday',
    timeSlotId: '1',
    weekType: 'both',
  },
  {
    id: 'l8',
    subjectId: 's4',
    teacherId: 't3',
    groupId: 'g1',
    roomId: 'r3',
    type: 'lab',
    dayOfWeek: 'wednesday',
    timeSlotId: '2',
    weekType: 'both',
  },
  // Thursday
  {
    id: 'l9',
    subjectId: 's5',
    teacherId: 't4',
    groupId: 'g1',
    roomId: 'r5',
    type: 'lecture',
    dayOfWeek: 'thursday',
    timeSlotId: '1',
    weekType: 'both',
  },
  {
    id: 'l10',
    subjectId: 's5',
    teacherId: 't4',
    groupId: 'g1',
    roomId: 'r6',
    type: 'practice',
    dayOfWeek: 'thursday',
    timeSlotId: '3',
    weekType: 'both',
  },
  // Friday
  {
    id: 'l11',
    subjectId: 's6',
    teacherId: 't2',
    groupId: 'g1',
    roomId: 'r1',
    type: 'lecture',
    dayOfWeek: 'friday',
    timeSlotId: '1',
    weekType: 'both',
  },
  {
    id: 'l12',
    subjectId: 's6',
    teacherId: 't2',
    groupId: 'g1',
    roomId: 'r2',
    type: 'practice',
    dayOfWeek: 'friday',
    timeSlotId: '2',
    weekType: 'both',
  },
  // Saturday (only even weeks)
  {
    id: 'l13',
    subjectId: 's1',
    teacherId: 't1',
    groupId: 'g1',
    roomId: 'r3',
    type: 'lab',
    dayOfWeek: 'saturday',
    timeSlotId: '1',
    weekType: 'even',
  },
];

// Helper function to populate lesson with related data
export function populateLesson(lesson: Lesson): Lesson {
  return {
    ...lesson,
    subject: mockSubjects.find(s => s.id === lesson.subjectId),
    teacher: mockTeachers.find(t => t.id === lesson.teacherId),
    group: mockGroups.find(g => g.id === lesson.groupId),
    room: mockRooms.find(r => r.id === lesson.roomId),
    timeSlot: mockTimeSlots.find(ts => ts.id === lesson.timeSlotId),
  };
}

// Get lessons for specific filters
export function getLessonsByFilters(
  lessons: Lesson[],
  filters: {
    groupId?: string;
    teacherId?: string;
    roomId?: string;
    dayOfWeek?: DayOfWeek;
    weekType?: 'odd' | 'even';
  }
): Lesson[] {
  return lessons.filter(lesson => {
    if (filters.groupId && lesson.groupId !== filters.groupId) return false;
    if (filters.teacherId && lesson.teacherId !== filters.teacherId) return false;
    if (filters.roomId && lesson.roomId !== filters.roomId) return false;
    if (filters.dayOfWeek && lesson.dayOfWeek !== filters.dayOfWeek) return false;
    if (filters.weekType && lesson.weekType !== 'both' && lesson.weekType !== filters.weekType) return false;
    return true;
  }).map(populateLesson);
}

// Get full teacher name
export function getTeacherFullName(teacher: Teacher): string {
  return `${teacher.lastName} ${teacher.firstName[0]}.${teacher.middleName?.[0] ? ` ${teacher.middleName[0]}.` : ''}`;
}

// Days of week in order
export const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const daysOfWeekRu: Record<DayOfWeek, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
};

export const lessonTypeRu: Record<string, string> = {
  lecture: 'Лекция',
  practice: 'Практика',
  lab: 'Лабораторная',
};

