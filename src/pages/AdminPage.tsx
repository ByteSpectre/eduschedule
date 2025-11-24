import { useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { 
  Plus,
  Trash2,
  Copy,
  AlertCircle,
  Save
} from 'lucide-react';
import {
  mockLessons,
  mockGroups,
  mockSubjects,
  mockTeachers,
  mockRooms,
  mockTimeSlots,
  daysOfWeek,
  daysOfWeekRu,
  lessonTypeRu,
  getTeacherFullName
} from '../utils/mockData';
import type { Lesson, DayOfWeek, LessonType, WeekType } from '../types/types';
import { cn } from '../utils/cn';

export function AdminPage() {
  const [selectedGroup, setSelectedGroup] = useState(mockGroups[0].id);
  const [weekType, setWeekType] = useState<'odd' | 'even'>('odd');
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Get lessons for selected group
  const groupLessons = useMemo(() => {
    return lessons.filter(
      l => l.groupId === selectedGroup && (l.weekType === 'both' || l.weekType === weekType)
    );
  }, [lessons, selectedGroup, weekType]);

  // Group lessons by day and time
  const scheduleGrid = useMemo(() => {
    const grid: Record<DayOfWeek, Record<string, Lesson | undefined>> = {
      monday: {},
      tuesday: {},
      wednesday: {},
      thursday: {},
      friday: {},
      saturday: {},
    };

    groupLessons.forEach(lesson => {
      grid[lesson.dayOfWeek][lesson.timeSlotId] = lesson;
    });

    return grid;
  }, [groupLessons]);

  // Check for conflicts
  const checkConflicts = (lesson: Lesson, lessons: Lesson[]) => {
    const conflicts: string[] = [];

    lessons.forEach(l => {
      if (l.id === lesson.id) return;
      if (l.dayOfWeek !== lesson.dayOfWeek || l.timeSlotId !== lesson.timeSlotId) return;
      if (l.weekType !== 'both' && lesson.weekType !== 'both' && l.weekType !== lesson.weekType) return;

      // Check teacher conflict
      if (l.teacherId === lesson.teacherId) {
        const teacher = mockTeachers.find(t => t.id === lesson.teacherId);
        conflicts.push(`Преподаватель ${teacher ? getTeacherFullName(teacher) : 'N/A'} уже занят в это время`);
      }

      // Check room conflict
      if (l.roomId === lesson.roomId) {
        const room = mockRooms.find(r => r.id === lesson.roomId);
        conflicts.push(`Аудитория ${room?.number || 'N/A'} уже занята в это время`);
      }
    });

    return conflicts;
  };

  const handleCellClick = (day: DayOfWeek, timeSlotId: string) => {
    const existingLesson = scheduleGrid[day][timeSlotId];
    
    if (existingLesson) {
      // Populate full data
      const fullLesson = {
        ...existingLesson,
        subject: mockSubjects.find(s => s.id === existingLesson.subjectId),
        teacher: mockTeachers.find(t => t.id === existingLesson.teacherId),
        group: mockGroups.find(g => g.id === existingLesson.groupId),
        room: mockRooms.find(r => r.id === existingLesson.roomId),
        timeSlot: mockTimeSlots.find(ts => ts.id === existingLesson.timeSlotId),
      };
      setEditingLesson(fullLesson);
    } else {
      // Create new lesson
      setEditingLesson({
        id: `new-${Date.now()}`,
        subjectId: mockSubjects[0].id,
        teacherId: mockTeachers[0].id,
        groupId: selectedGroup,
        roomId: mockRooms[0].id,
        type: 'lecture',
        dayOfWeek: day,
        timeSlotId: timeSlotId,
        weekType: weekType,
        subject: mockSubjects[0],
        teacher: mockTeachers[0],
        group: mockGroups.find(g => g.id === selectedGroup),
        room: mockRooms[0],
        timeSlot: mockTimeSlots.find(ts => ts.id === timeSlotId),
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveLesson = () => {
    if (!editingLesson) return;

    const isNew = editingLesson.id.startsWith('new-');
    const lessonToSave = { ...editingLesson };
    
    if (isNew) {
      lessonToSave.id = `l${Date.now()}`;
    }

    // Check conflicts
    const foundConflicts = checkConflicts(lessonToSave, lessons);
    setConflicts(foundConflicts);

    if (foundConflicts.length > 0) {
      return; // Don't save if there are conflicts
    }

    if (isNew) {
      setLessons([...lessons, lessonToSave]);
    } else {
      setLessons(lessons.map(l => l.id === lessonToSave.id ? lessonToSave : l));
    }

    setIsModalOpen(false);
    setEditingLesson(null);
  };

  const handleDeleteLesson = () => {
    if (!editingLesson) return;
    setLessons(lessons.filter(l => l.id !== editingLesson.id));
    setIsModalOpen(false);
    setEditingLesson(null);
  };

  const handleCopyWeek = () => {
    // Copy current week's schedule to the opposite week
    const targetWeek = weekType === 'odd' ? 'even' : 'odd';
    const newLessons = groupLessons.map(lesson => ({
      ...lesson,
      id: `l${Date.now()}-${Math.random()}`,
      weekType: targetWeek as WeekType,
    }));
    setLessons([...lessons, ...newLessons]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Редактор расписания
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Создавайте и редактируйте расписание с проверкой конфликтов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleCopyWeek}>
            <Copy className="w-4 h-4 mr-2" />
            Копировать неделю
          </Button>
          <Button variant="primary">
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Группа
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="input"
              >
                {mockGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.course} курс)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Неделя
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setWeekType('odd')}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                    weekType === 'odd'
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  Нечетная
                </button>
                <button
                  onClick={() => setWeekType('even')}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                    weekType === 'even'
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  Четная
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Schedule Grid */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky-header">
              <tr>
                <th className="w-32 px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800">
                  Время
                </th>
                {daysOfWeek.map(day => (
                  <th
                    key={day}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800"
                  >
                    {daysOfWeekRu[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockTimeSlots.map(timeSlot => (
                <tr key={timeSlot.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 align-top">
                    <div>{timeSlot.startTime}</div>
                    <div className="text-xs">{timeSlot.endTime}</div>
                  </td>
                  {daysOfWeek.map(day => {
                    const lesson = scheduleGrid[day][timeSlot.id];
                    const hasConflict = lesson ? checkConflicts(lesson, lessons).length > 0 : false;

                    return (
                      <td
                        key={day}
                        onClick={() => handleCellClick(day, timeSlot.id)}
                        className={cn(
                          'px-3 py-3 align-top cursor-pointer transition-colors',
                          lesson 
                            ? 'hover:opacity-80' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                          hasConflict && 'ring-2 ring-red-500'
                        )}
                      >
                        {lesson ? (
                          <div className={cn(
                            'lesson-card p-3 relative',
                            lesson.type === 'lecture' && 'lesson-lecture',
                            lesson.type === 'practice' && 'lesson-practice',
                            lesson.type === 'lab' && 'lesson-lab'
                          )}>
                            {hasConflict && (
                              <div className="absolute top-2 right-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              </div>
                            )}
                            <div className="text-xs font-semibold uppercase mb-1 text-gray-700">
                              {lessonTypeRu[lesson.type]}
                            </div>
                            <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                              {mockSubjects.find(s => s.id === lesson.subjectId)?.name}
                            </div>
                            <div className="text-xs text-gray-700">
                              {mockRooms.find(r => r.id === lesson.roomId)?.number}
                            </div>
                          </div>
                        ) : (
                          <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg group-hover:border-brand-400 transition-colors">
                            <Plus className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit/Create Lesson Modal */}
      {editingLesson && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingLesson(null);
            setConflicts([]);
          }}
          title={editingLesson.id.startsWith('new-') ? 'Создать занятие' : 'Редактировать занятие'}
          size="lg"
        >
          <div className="space-y-4">
            {/* Conflicts Warning */}
            {conflicts.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                      Обнаружены конфликты:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 space-y-1">
                      {conflicts.map((conflict, i) => (
                        <li key={i}>{conflict}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Предмет
                </label>
                <select
                  value={editingLesson.subjectId}
                  onChange={(e) => setEditingLesson({ ...editingLesson, subjectId: e.target.value })}
                  className="input"
                >
                  {mockSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Тип занятия
                </label>
                <select
                  value={editingLesson.type}
                  onChange={(e) => setEditingLesson({ ...editingLesson, type: e.target.value as LessonType })}
                  className="input"
                >
                  <option value="lecture">Лекция</option>
                  <option value="practice">Практика</option>
                  <option value="lab">Лабораторная</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Преподаватель
                </label>
                <select
                  value={editingLesson.teacherId}
                  onChange={(e) => setEditingLesson({ ...editingLesson, teacherId: e.target.value })}
                  className="input"
                >
                  {mockTeachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {getTeacherFullName(teacher)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Аудитория
                </label>
                <select
                  value={editingLesson.roomId}
                  onChange={(e) => setEditingLesson({ ...editingLesson, roomId: e.target.value })}
                  className="input"
                >
                  {mockRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.number} - {room.building} (вместимость: {room.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Периодичность
                </label>
                <select
                  value={editingLesson.weekType}
                  onChange={(e) => setEditingLesson({ ...editingLesson, weekType: e.target.value as WeekType })}
                  className="input"
                >
                  <option value="both">Каждую неделю</option>
                  <option value="odd">Только нечетные недели</option>
                  <option value="even">Только четные недели</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              {!editingLesson.id.startsWith('new-') && (
                <Button variant="secondary" onClick={handleDeleteLesson}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </Button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingLesson(null);
                    setConflicts([]);
                  }}
                >
                  Отмена
                </Button>
                <Button variant="primary" onClick={handleSaveLesson}>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

