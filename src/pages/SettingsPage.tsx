import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTheme } from '../contexts/ThemeContext';
import {
  Moon,
  Sun,
  Clock,
  Bell,
  Save,
  Plus,
  Trash2,
  Users as UsersIcon
} from 'lucide-react';
import { mockTimeSlots } from '../utils/mockData';
import type { TimeSlot } from '../types/types';
import { cn } from '../utils/cn';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(mockTimeSlots);
  const [notifications, setNotifications] = useState(true);

  const handleAddTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: `ts${Date.now()}`,
      startTime: '19:00',
      endTime: '20:30',
      order: timeSlots.length + 1,
    };
    setTimeSlots([...timeSlots, newSlot]);
  };

  const handleDeleteTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(ts => ts.id !== id));
  };

  const handleUpdateTimeSlot = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeSlots(timeSlots.map(ts =>
      ts.id === id ? { ...ts, [field]: value } : ts
    ));
  };

  const handleSave = () => {
    // Save to backend
    alert('Настройки сохранены!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Настройки системы
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Управление параметрами расписания и системы
        </p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {theme === 'light' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-brand-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Внешний вид
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Тема оформления
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Выберите светлую или темную тему
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={cn(
                  'relative inline-flex h-8 w-16 items-center rounded-full transition-colors',
                  theme === 'dark' ? 'bg-brand-500' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                    theme === 'dark' ? 'translate-x-9' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-brand-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Расписание звонков
              </h3>
            </div>
            <Button variant="secondary" size="sm" onClick={handleAddTimeSlot}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить пару
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Настройте время начала и окончания учебных пар
            </p>
            
            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-8">
                    {index + 1}
                  </span>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleUpdateTimeSlot(slot.id, 'startTime', e.target.value)}
                      className="input text-sm font-mono"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleUpdateTimeSlot(slot.id, 'endTime', e.target.value)}
                      className="input text-sm font-mono"
                    />
                  </div>

                  {timeSlots.length > 1 && (
                    <button
                      onClick={() => handleDeleteTimeSlot(slot.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Уведомления
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Уведомления о конфликтах
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Получать уведомления при обнаружении конфликтов в расписании
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={cn(
                  'relative inline-flex h-8 w-16 items-center rounded-full transition-colors',
                  notifications ? 'bg-brand-500' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                    notifications ? 'translate-x-9' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <UsersIcon className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Управление пользователями
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Управление правами доступа к системе
            </p>

            <div className="overflow-x-auto">
              <table className="table-minimal">
                <thead>
                  <tr>
                    <th>Роль</th>
                    <th>Описание</th>
                    <th>Пользователей</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold">
                        Администратор
                      </span>
                    </td>
                    <td className="text-sm text-gray-600 dark:text-gray-400">
                      Полный доступ ко всем функциям
                    </td>
                    <td className="font-semibold">3</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">
                        Редактор
                      </span>
                    </td>
                    <td className="text-sm text-gray-600 dark:text-gray-400">
                      Создание и редактирование расписания
                    </td>
                    <td className="font-semibold">8</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                        Просмотр
                      </span>
                    </td>
                    <td className="text-sm text-gray-600 dark:text-gray-400">
                      Только просмотр расписания
                    </td>
                    <td className="font-semibold">247</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Button variant="secondary" className="w-full">
              Управление пользователями
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Информация о системе
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Версия</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Последнее обновление</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">24.11.2025</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Разработчик</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">EduSchedule Team</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} size="lg">
          <Save className="w-5 h-5 mr-2" />
          Сохранить все изменения
        </Button>
      </div>
    </div>
  );
}

