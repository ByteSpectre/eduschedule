import { useState, useMemo } from 'react';
import { SearchBar } from '../components/SearchBar';
import { LessonCard } from '../components/LessonCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Download,
  Coffee,
  MapPin,
  User,
  Clock
} from 'lucide-react';
import { 
  mockLessons, 
  daysOfWeek, 
  daysOfWeekRu, 
  mockTimeSlots,
  getLessonsByFilters,
  getTeacherFullName,
  lessonTypeRu
} from '../utils/mockData';
import type { Lesson, DayOfWeek } from '../types/types';
import { format, addWeeks, startOfWeek, isThisWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '../utils/cn';

type FilterType = 'group' | 'teacher' | 'room' | null;

export function ViewerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<FilterType>(null);
  const [filterId, setFilterId] = useState<string | null>(null);
  const [filterLabel, setFilterLabel] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Determine if current week is odd or even
  const weekNumber = Math.ceil(
    (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / 
    (7 * 24 * 60 * 60 * 1000)
  );
  const weekType = weekNumber % 2 === 0 ? 'even' : 'odd';

  // Get filtered lessons
  const filteredLessons = useMemo(() => {
    if (!filterType || !filterId) return [];
    
    const filters: any = { weekType };
    if (filterType === 'group') filters.groupId = filterId;
    if (filterType === 'teacher') filters.teacherId = filterId;
    if (filterType === 'room') filters.roomId = filterId;

    return getLessonsByFilters(mockLessons, filters);
  }, [filterType, filterId, weekType]);

  const handleSearch = (result: any) => {
    setFilterType(result.type);
    setFilterId(result.id);
    setFilterLabel(result.label);
    setViewMode('table');
  };

  const handleWeekChange = (weeks: number) => {
    setCurrentDate(prev => addWeeks(prev, weeks));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Group lessons by day
  const lessonsByDay = useMemo(() => {
    const grouped: Record<DayOfWeek, Lesson[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
    };

    filteredLessons.forEach(lesson => {
      grouped[lesson.dayOfWeek].push(lesson);
    });

    // Sort by time slot
    Object.keys(grouped).forEach(day => {
      grouped[day as DayOfWeek].sort((a, b) => {
        const slotA = mockTimeSlots.find(s => s.id === a.timeSlotId);
        const slotB = mockTimeSlots.find(s => s.id === b.timeSlotId);
        return (slotA?.order || 0) - (slotB?.order || 0);
      });
    });

    return grouped;
  }, [filteredLessons]);

  // Current time indicator
  const currentTime = new Date();
  const currentDay = format(currentTime, 'EEEE', { locale: ru }).toLowerCase();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const isToday = (day: string) => {
    const dayMap: Record<string, DayOfWeek> = {
      'понедельник': 'monday',
      'вторник': 'tuesday',
      'среда': 'wednesday',
      'четверг': 'thursday',
      'пятница': 'friday',
      'суббота': 'saturday',
    };
    return dayMap[currentDay] === day && isThisWeek(currentDate);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search Section */}
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Расписание занятий
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Найдите свое расписание по группе, преподавателю или аудитории
          </p>
        </div>
        <SearchBar onSelect={handleSearch} />
      </div>

      {/* Schedule Display */}
      {filterType && filterId ? (
        <div className="space-y-6">
          {/* Header with controls */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-card p-6 shadow-card">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {filterLabel}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMMM', { locale: ru })} - 
                  {' '}{format(addWeeks(startOfWeek(currentDate, { weekStartsOn: 1 }), 1), 'd MMMM yyyy', { locale: ru })}
                </span>
                <span className="px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-md font-medium">
                  {weekType === 'odd' ? 'Нечетная неделя' : 'Четная неделя'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => handleWeekChange(-1)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToday}
                  className="mx-1"
                >
                  Сегодня
                </Button>
                <button
                  onClick={() => handleWeekChange(1)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-card shadow-card overflow-hidden">
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
                        className={cn(
                          'px-4 py-3 text-left text-sm font-semibold bg-gray-100 dark:bg-gray-800',
                          isToday(day)
                            ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                            : 'text-gray-700 dark:text-gray-300'
                        )}
                      >
                        <div>{daysOfWeekRu[day]}</div>
                        <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
                          {format(
                            addWeeks(startOfWeek(currentDate, { weekStartsOn: 1 }), 0),
                            'd MMM',
                            { locale: ru }
                          )}
                        </div>
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
                        const lesson = lessonsByDay[day].find(
                          l => l.timeSlotId === timeSlot.id
                        );

                        return (
                          <td
                            key={day}
                            className={cn(
                              'px-3 py-3 align-top relative',
                              isToday(day) && 'bg-brand-50/30 dark:bg-brand-900/10'
                            )}
                          >
                            {lesson ? (
                              <LessonCard
                                lesson={lesson}
                                onClick={() => setSelectedLesson(lesson)}
                                compact
                              />
                            ) : (
                              <div className="h-20" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-4">
            {daysOfWeek.map(day => {
              const dayLessons = lessonsByDay[day];
              
              return (
                <div key={day} className="bg-white dark:bg-gray-800 rounded-card shadow-card overflow-hidden">
                  <div className={cn(
                    'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
                    isToday(day) && 'bg-brand-50 dark:bg-brand-900/20'
                  )}>
                    <h3 className={cn(
                      'text-lg font-semibold',
                      isToday(day) 
                        ? 'text-brand-600 dark:text-brand-400' 
                        : 'text-gray-900 dark:text-white'
                    )}>
                      {daysOfWeekRu[day]}
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {dayLessons.length > 0 ? (
                      dayLessons.map(lesson => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          onClick={() => setSelectedLesson(lesson)}
                        />
                      ))
                    ) : (
                      <EmptyState
                        icon={<Coffee className="w-12 h-12" />}
                        title="Нет занятий"
                        description="В этот день нет запланированных занятий"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-12">
          <EmptyState
            icon={<CalendarIcon className="w-16 h-16" />}
            title="Выберите расписание"
            description="Используйте поиск выше, чтобы найти расписание по группе, преподавателю или аудитории"
          />
        </div>
      )}

      {/* Lesson Details Modal */}
      {selectedLesson && (
        <Modal
          isOpen={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
          title="Детали занятия"
          size="lg"
        >
          <div className="space-y-6">
            {/* Subject */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold uppercase',
                  selectedLesson.type === 'lecture' && 'bg-lesson-lecture-light text-lesson-lecture',
                  selectedLesson.type === 'practice' && 'bg-lesson-practice-light text-lesson-practice',
                  selectedLesson.type === 'lab' && 'bg-lesson-lab-light text-lesson-lab'
                )}>
                  {lessonTypeRu[selectedLesson.type]}
                </span>
                {selectedLesson.weekType !== 'both' && (
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-medium">
                    {selectedLesson.weekType === 'odd' ? 'Нечетная неделя' : 'Четная неделя'}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedLesson.subject?.name}
              </h3>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {selectedLesson.teacher && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Преподаватель</div>
                      <div className="text-base font-medium text-gray-900 dark:text-white">
                        {getTeacherFullName(selectedLesson.teacher)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedLesson.teacher.department}
                      </div>
                    </div>
                  </div>
                )}

                {selectedLesson.group && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">👥</span>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Группа</div>
                      <div className="text-base font-medium text-gray-900 dark:text-white">
                        {selectedLesson.group.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedLesson.group.course} курс, {selectedLesson.group.studentCount} студентов
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {selectedLesson.room && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Аудитория</div>
                      <div className="text-base font-medium text-gray-900 dark:text-white">
                        {selectedLesson.room.number}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedLesson.room.building}, вместимость: {selectedLesson.room.capacity}
                      </div>
                    </div>
                  </div>
                )}

                {selectedLesson.timeSlot && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Время</div>
                      <div className="text-base font-medium font-mono text-gray-900 dark:text-white">
                        {selectedLesson.timeSlot.startTime} - {selectedLesson.timeSlot.endTime}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {daysOfWeekRu[selectedLesson.dayOfWeek]}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

