import type { Lesson, LessonType } from '../types/types';
import { lessonTypeRu, getTeacherFullName } from '../utils/mockData';
import { cn } from '../utils/cn';
import { MapPin, User, Clock } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  onClick?: () => void;
  compact?: boolean;
}

const lessonTypeStyles: Record<LessonType, string> = {
  lecture: 'lesson-lecture',
  practice: 'lesson-practice',
  lab: 'lesson-lab',
};

const lessonTypeColors: Record<LessonType, string> = {
  lecture: 'text-lesson-lecture',
  practice: 'text-lesson-practice',
  lab: 'text-lesson-lab',
};

export function LessonCard({ lesson, onClick, compact = false }: LessonCardProps) {
  const lessonType = lesson.type;
  
  return (
    <div
      className={cn(
        'lesson-card cursor-pointer',
        lessonTypeStyles[lessonType],
        compact ? 'p-2' : 'p-4'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-xs font-semibold uppercase tracking-wide',
              lessonTypeColors[lessonType]
            )}>
              {lessonTypeRu[lessonType]}
            </span>
            {lesson.weekType !== 'both' && (
              <span className="text-xs text-gray-600">
                ({lesson.weekType === 'odd' ? 'Нечетная' : 'Четная'})
              </span>
            )}
          </div>
          
          <h3 className={cn(
            'font-semibold text-gray-900 truncate',
            compact ? 'text-sm' : 'text-base'
          )}>
            {lesson.subject?.name}
          </h3>
          
          {!compact && (
            <div className="mt-2 space-y-1">
              {lesson.teacher && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{getTeacherFullName(lesson.teacher)}</span>
                </div>
              )}
              
              {lesson.room && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>Ауд. {lesson.room.number}, {lesson.room.building}</span>
                </div>
              )}
              
              {lesson.timeSlot && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="font-mono">{lesson.timeSlot.startTime} - {lesson.timeSlot.endTime}</span>
                </div>
              )}
            </div>
          )}
          
          {compact && lesson.room && (
            <p className="text-xs text-gray-700 mt-1">
              {lesson.room.number}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

