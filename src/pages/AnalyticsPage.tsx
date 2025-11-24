import { useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../components/Card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  AlertCircle,
  Users,
  MapPin,
  Clock,
  Calendar
} from 'lucide-react';
import {
  mockLessons,
  mockTeachers,
  mockRooms,
  mockTimeSlots,
  daysOfWeek,
  daysOfWeekRu,
  getTeacherFullName
} from '../utils/mockData';
import { cn } from '../utils/cn';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export function AnalyticsPage() {
  // Calculate room utilization
  const roomUtilization = useMemo(() => {
    const utilization = mockRooms.map(room => {
      const totalSlots = daysOfWeek.length * mockTimeSlots.length;
      const occupiedSlots = mockLessons.filter(l => l.roomId === room.id).length;
      const percentage = Math.round((occupiedSlots / totalSlots) * 100);

      return {
        id: room.id,
        name: `${room.number}`,
        building: room.building,
        capacity: room.capacity,
        totalSlots,
        occupiedSlots,
        percentage,
      };
    });

    return utilization.sort((a, b) => b.percentage - a.percentage);
  }, []);

  // Calculate teacher workload
  const teacherWorkload = useMemo(() => {
    const workload = mockTeachers.map(teacher => {
      const lessons = mockLessons.filter(l => l.teacherId === teacher.id);
      const hoursPerWeek = lessons.length * 1.5; // Assuming 1.5 hours per lesson

      return {
        id: teacher.id,
        name: getTeacherFullName(teacher),
        department: teacher.department,
        lessonsCount: lessons.length,
        hoursPerWeek,
      };
    });

    return workload.sort((a, b) => b.hoursPerWeek - a.hoursPerWeek);
  }, []);

  // Lessons by day
  const lessonsByDay = useMemo(() => {
    return daysOfWeek.map(day => ({
      day: daysOfWeekRu[day],
      lessons: mockLessons.filter(l => l.dayOfWeek === day).length,
    }));
  }, []);

  // Lessons by type
  const lessonsByType = useMemo(() => {
    const types = {
      lecture: mockLessons.filter(l => l.type === 'lecture').length,
      practice: mockLessons.filter(l => l.type === 'practice').length,
      lab: mockLessons.filter(l => l.type === 'lab').length,
    };

    return [
      { name: 'Лекции', value: types.lecture, color: '#f59e0b' },
      { name: 'Практики', value: types.practice, color: '#059669' },
      { name: 'Лабораторные', value: types.lab, color: '#7c3aed' },
    ];
  }, []);

  // Peak hours
  const peakHours = useMemo(() => {
    return mockTimeSlots.map(slot => ({
      time: slot.startTime,
      lessons: mockLessons.filter(l => l.timeSlotId === slot.id).length,
    }));
  }, []);

  // Summary stats
  const stats = [
    {
      label: 'Всего занятий',
      value: mockLessons.length,
      icon: Calendar,
      color: 'text-brand-600 dark:text-brand-400',
      bgColor: 'bg-brand-100 dark:bg-brand-900/20',
    },
    {
      label: 'Средняя загрузка аудиторий',
      value: `${Math.round(roomUtilization.reduce((acc, r) => acc + r.percentage, 0) / roomUtilization.length)}%`,
      icon: MapPin,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      label: 'Преподавателей',
      value: mockTeachers.length,
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Средняя нагрузка',
      value: `${Math.round(teacherWorkload.reduce((acc, t) => acc + t.hoursPerWeek, 0) / teacherWorkload.length)} ч/нед`,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Аналитика
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Визуализация эффективности использования ресурсов
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn('p-4 rounded-xl', stat.bgColor)}>
                    <Icon className={cn('w-8 h-8', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lessons by Day */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Распределение занятий по дням недели
            </h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lessonsByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="day" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="lessons" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lessons by Type */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Типы занятий
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lessonsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {lessonsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Пиковые часы нагрузки
          </h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="time" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="lessons" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Room Utilization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Загруженность аудиторий
            </h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roomUtilization.map((room) => (
              <div key={room.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {room.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {room.building}
                    </span>
                  </div>
                  <span className={cn(
                    'text-sm font-semibold',
                    room.percentage > 70 ? 'text-red-600 dark:text-red-400' :
                    room.percentage > 40 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  )}>
                    {room.percentage}%
                  </span>
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full transition-all',
                      room.percentage > 70 ? 'bg-red-500' :
                      room.percentage > 40 ? 'bg-yellow-500' :
                      'bg-green-500'
                    )}
                    style={{ width: `${room.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {room.occupiedSlots} из {room.totalSlots} слотов
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Вместимость: {room.capacity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teacher Workload */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Нагрузка преподавателей
            </h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="table-minimal">
              <thead>
                <tr>
                  <th>Преподаватель</th>
                  <th>Кафедра</th>
                  <th className="text-center">Занятий</th>
                  <th className="text-center">Часов/неделя</th>
                  <th>Нагрузка</th>
                </tr>
              </thead>
              <tbody>
                {teacherWorkload.map((teacher) => {
                  const overloaded = teacher.hoursPerWeek > 20;
                  const normal = teacher.hoursPerWeek >= 10 && teacher.hoursPerWeek <= 20;
                  
                  return (
                    <tr key={teacher.id}>
                      <td className="font-medium">{teacher.name}</td>
                      <td className="text-sm text-gray-600 dark:text-gray-400">
                        {teacher.department}
                      </td>
                      <td className="text-center font-semibold">{teacher.lessonsCount}</td>
                      <td className="text-center font-mono font-semibold">
                        {teacher.hoursPerWeek}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[200px]">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                overloaded ? 'bg-red-500' :
                                normal ? 'bg-green-500' :
                                'bg-yellow-500'
                              )}
                              style={{ width: `${Math.min((teacher.hoursPerWeek / 25) * 100, 100)}%` }}
                            />
                          </div>
                          {overloaded && (
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

