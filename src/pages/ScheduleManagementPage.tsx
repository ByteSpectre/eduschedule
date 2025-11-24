import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import {
  Plus,
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
} from 'lucide-react';
import type { Branch, ScheduleVersion, ScheduleType, WeekScheduleType, DayOfWeek } from '../types/types';
import { cn } from '../utils/cn';
import { daysOfWeekRu } from '../utils/mockData';
import { useAuth } from '../hooks/useAuth';
import { fetchBranches } from '../api/branches';
import {
  createSchedule,
  deleteSchedule,
  duplicateSchedule,
  fetchSchedules,
  updateSchedule,
} from '../api/schedules';

const allDays: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function ScheduleManagementPage() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [schedules, setSchedules] = useState<ScheduleVersion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleVersion | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'template' as ScheduleType,
    weekType: 'one_week' as WeekScheduleType,
    daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as DayOfWeek[],
    lessonsPerDay: 7,
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [listError, setListError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  useEffect(() => {
    if (!user?.organizationId) return;
    let isMounted = true;
    setIsLoadingBranches(true);
    fetchBranches(user.organizationId)
      .then((data) => {
        if (isMounted) {
          setBranches(data);
          if (data.length > 0) {
            setSelectedBranchId(data[0].id);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setListError('Не удалось загрузить филиалы');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingBranches(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.organizationId]);

  useEffect(() => {
    if (!selectedBranchId) {
      setSchedules([]);
      return;
    }

    let isMounted = true;
    setIsLoadingSchedules(true);
    setListError('');
    fetchSchedules({ branchId: selectedBranchId })
      .then((data) => {
        if (isMounted) {
          setSchedules(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setListError('Не удалось загрузить расписания');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingSchedules(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBranchId]);

  const filteredSchedules = useMemo(() => schedules, [schedules]);

  const handleOpenModal = (schedule?: ScheduleVersion) => {
    if (!selectedBranchId) return;

    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        name: schedule.name,
        type: schedule.type,
        weekType: schedule.weekType,
        daysOfWeek: schedule.daysOfWeek,
        lessonsPerDay: schedule.lessonsPerDay,
        startDate: schedule.startDate ? schedule.startDate.toISOString().split('T')[0] : '',
        endDate: schedule.endDate ? schedule.endDate.toISOString().split('T')[0] : '',
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        name: '',
        type: 'template',
        weekType: 'one_week',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        lessonsPerDay: 7,
        startDate: '',
        endDate: '',
      });
    }
    setErrors({});
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
    setFormData({
      name: '',
      type: 'template',
      weekType: 'one_week',
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      lessonsPerDay: 7,
      startDate: '',
      endDate: '',
    });
    setErrors({});
    setFormError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название расписания';
    }

    if (formData.daysOfWeek.length === 0) {
      newErrors.daysOfWeek = 'Выберите хотя бы один день';
    }

    if (formData.lessonsPerDay < 1 || formData.lessonsPerDay > 18) {
      newErrors.lessonsPerDay = 'Количество уроков должно быть от 1 до 18';
    }

    if (formData.type === 'period') {
      if (!formData.startDate) {
        newErrors.startDate = 'Укажите дату начала';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'Укажите дату окончания';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user?.organizationId || !selectedBranchId) return;

    try {
      if (editingSchedule) {
        const updated = await updateSchedule(editingSchedule.id, {
          name: formData.name,
          type: formData.type,
          weekType: formData.weekType,
          daysOfWeek: formData.daysOfWeek,
          lessonsPerDay: formData.lessonsPerDay,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
        });
        setSchedules(prev => prev.map(schedule => (schedule.id === updated.id ? updated : schedule)));
      } else {
        const newSchedule = await createSchedule({
          organizationId: user.organizationId,
          branchId: selectedBranchId,
          name: formData.name,
          type: formData.type,
          weekType: formData.weekType,
          daysOfWeek: formData.daysOfWeek,
          lessonsPerDay: formData.lessonsPerDay,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
        });
        setSchedules(prev => [...prev, newSchedule]);
      }

      handleCloseModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Не удалось сохранить расписание');
    }
  };

  const handleCopy = async (schedule: ScheduleVersion) => {
    try {
      const copy = await duplicateSchedule(schedule.id);
      setSchedules(prev => [...prev, copy]);
      setSelectedScheduleId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось создать копию');
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это расписание?')) {
      return;
    }
    try {
      await deleteSchedule(scheduleId);
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      setSelectedScheduleId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось удалить расписание');
    }
  };

  const handleDayToggle = (day: DayOfWeek) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  if (!user?.organizationId) {
    return (
      <Card className="p-8">
        <p className="text-center text-gray-600 dark:text-gray-300">
          Для управления расписаниями войдите под учетной записью администратора организации.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-2 w-full lg:w-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Расписания</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Создавайте и управляйте версиями расписания
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none transition-colors"
            disabled={isLoadingBranches || branches.length === 0}
          >
            {branches.length === 0 && <option value="">Нет филиалов</option>}
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleOpenModal()}
            disabled={!selectedBranchId}
          >
            <Plus className="w-5 h-5 mr-2" />
            Добавить расписание
          </Button>
        </div>
      </div>

      {/* Schedules List */}
      {!selectedBranchId ? (
        <Card className="p-12">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Выберите филиал, чтобы увидеть расписания
          </div>
        </Card>
      ) : isLoadingSchedules ? (
        <Card className="p-12">
          <div className="text-center text-gray-500 dark:text-gray-400">Загрузка расписаний...</div>
        </Card>
      ) : listError ? (
        <Card className="p-12">
          <div className="text-center text-red-500 dark:text-red-400">{listError}</div>
        </Card>
      ) : filteredSchedules.length > 0 ? (
        <div className="space-y-4">
          {filteredSchedules.map(schedule => (
            <Card key={schedule.id} className="p-6 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {schedule.name}
                      </h3>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        schedule.type === 'template'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      )}>
                        {schedule.type === 'template' ? 'Шаблон' : 'На период'}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                        {schedule.weekType === 'one_week' ? 'Одна неделя' : 'Четная/Нечетная'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Дни: </span>
                        {schedule.daysOfWeek.map(day => daysOfWeekRu[day]).join(', ')}
                      </div>
                      <div>
                        <span className="font-medium">Уроков в день: </span>
                        {schedule.lessonsPerDay}
                      </div>
                      {schedule.type === 'period' && schedule.startDate && (
                        <div>
                          <span className="font-medium">Период: </span>
                          {schedule.startDate.toLocaleDateString('ru-RU')} - {schedule.endDate?.toLocaleDateString('ru-RU')}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Создано {schedule.createdAt.toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => setSelectedScheduleId(selectedScheduleId === schedule.id ? null : schedule.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>

                  {selectedScheduleId === schedule.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10">
                      <button
                        onClick={() => {
                          handleOpenModal(schedule);
                          setSelectedScheduleId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Редактировать</span>
                      </button>
                      <button
                        onClick={() => {
                          handleCopy(schedule);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Создать копию</span>
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-b-xl"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">Удалить запись</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <EmptyState
            icon={<CalendarIcon className="w-16 h-16" />}
            title="Нет расписаний"
            description="Создайте первое расписание для вашей организации"
          />
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSchedule ? 'Редактировать расписание' : 'Добавить расписание'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Название *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Первая четверть"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тип
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ScheduleType }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-brand-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
            >
              <option value="template">Шаблон</option>
              <option value="period">На период</option>
            </select>
          </div>

          {/* Week Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тип недели
            </label>
            <select
              value={formData.weekType}
              onChange={(e) => setFormData(prev => ({ ...prev, weekType: e.target.value as WeekScheduleType }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-brand-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
              disabled={!!editingSchedule}
            >
              <option value="one_week">Одна неделя</option>
              <option value="two_weeks">Четная/Нечетная</option>
            </select>
            {editingSchedule && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Тип недели не может быть изменен после создания
              </p>
            )}
          </div>

          {/* Dates */}
          {formData.type === 'period' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Дата начала *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Дата окончания *
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>
                )}
              </div>
            </div>
          )}

          {/* Days of Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Дней в неделю
            </label>
            <div className="flex flex-wrap gap-2">
              {allDays.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                    formData.daysOfWeek.includes(day)
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  )}
                >
                  {daysOfWeekRu[day].slice(0, 2)}
                </button>
              ))}
            </div>
            {errors.daysOfWeek && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.daysOfWeek}</p>
            )}
          </div>

          {/* Lessons Per Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Уроков в день (1-18)
            </label>
            <Input
              type="number"
              min="1"
              max="18"
              value={formData.lessonsPerDay}
              onChange={(e) => setFormData(prev => ({ ...prev, lessonsPerDay: parseInt(e.target.value) || 1 }))}
            />
            {errors.lessonsPerDay && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lessonsPerDay}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Отмена
            </Button>
            <Button type="submit" variant="primary">
              {editingSchedule ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
          {formError && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">{formError}</p>
          )}
        </form>
      </Modal>
    </div>
  );
}

