import { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import {
  Users,
  User,
  MapPin,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import type { Branch, Group, Room, Subject, Teacher } from '../types/types';
import { cn } from '../utils/cn';
import { fetchBranches } from '../api/branches';
import { fetchGroups, createGroup, updateGroup, deleteGroup } from '../api/groups';
import {
  fetchTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../api/teachers';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../api/rooms';
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../api/subjects';
import { getTeacherFullName } from '../utils/mockData';
import { useAuth } from '../hooks/useAuth';

type TabType = 'groups' | 'teachers' | 'rooms' | 'subjects';

const tabConfig: Record<TabType, { label: string; icon: typeof Users }> = {
  groups: { label: 'Группы', icon: Users },
  teachers: { label: 'Преподаватели', icon: User },
  rooms: { label: 'Аудитории', icon: MapPin },
  subjects: { label: 'Предметы', icon: BookOpen },
};

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';
const inputClass =
  'w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-brand-500 focus:outline-none transition-colors';

export function DataPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState('');
  const [modalState, setModalState] = useState<{ tab: TabType; item?: any } | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const counts = {
    groups: groups.length,
    teachers: teachers.length,
    rooms: rooms.length,
    subjects: subjects.length,
  };

  const loadBranches = useCallback(async () => {
    if (!user?.organizationId) {
      setBranches([]);
      return;
    }
    setBranchesLoading(true);
    try {
      const data = await fetchBranches();
      setBranches(data);
    } catch (error) {
      console.error(error);
    } finally {
      setBranchesLoading(false);
    }
  }, [user?.organizationId]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const loadTab = useCallback(
    async (tab: TabType) => {
      if (!user?.organizationId) {
        return;
      }
      setTabLoading(true);
      setTabError('');
      try {
        switch (tab) {
          case 'groups':
            setGroups(await fetchGroups());
            break;
          case 'teachers':
            setTeachers(await fetchTeachers());
            break;
          case 'rooms':
            setRooms(await fetchRooms());
            break;
          case 'subjects':
            setSubjects(await fetchSubjects());
            break;
          default:
            break;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось загрузить данные';
        setTabError(message);
      } finally {
        setTabLoading(false);
      }
    },
    [user?.organizationId],
  );

  useEffect(() => {
    if (user?.organizationId) {
      loadTab(activeTab);
    }
  }, [activeTab, loadTab, user?.organizationId]);

  const handleOpenCreate = () => {
    setModalState({ tab: activeTab });
    setSaveError('');
  };

  const handleOpenEdit = (item: any) => {
    setModalState({ tab: activeTab, item });
    setSaveError('');
  };

  const handleCloseModal = () => {
    setModalState(null);
    setSaveError('');
  };

  const handleDelete = async (tab: TabType, item: any) => {
    if (!confirm(`Удалить "${item.name || item.number}"?`)) {
      return;
    }
    try {
      switch (tab) {
        case 'groups':
          await deleteGroup(item.id);
          break;
        case 'teachers':
          await deleteTeacher(item.id);
          break;
        case 'rooms':
          await deleteRoom(item.id);
          break;
        case 'subjects':
          await deleteSubject(item.id);
          break;
        default:
          break;
      }
      await loadTab(tab);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не удалось удалить запись');
    }
  };

  const handleModalSubmit = async (values: any) => {
    if (!modalState) return;
    setIsSaving(true);
    setSaveError('');
    try {
      switch (modalState.tab) {
        case 'groups':
          if (modalState.item) {
            await updateGroup(modalState.item.id, values);
          } else {
            await createGroup(values);
          }
          break;
        case 'teachers':
          if (modalState.item) {
            await updateTeacher(modalState.item.id, values);
          } else {
            await createTeacher(values);
          }
          break;
        case 'rooms':
          if (modalState.item) {
            await updateRoom(modalState.item.id, values);
          } else {
            await createRoom(values);
          }
          break;
        case 'subjects':
          if (modalState.item) {
            await updateSubject(modalState.item.id, values);
          } else {
            await createSubject(values);
          }
          break;
        default:
          break;
      }
      await loadTab(modalState.tab);
      handleCloseModal();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  };

  const tabNeedsBranches = activeTab === 'groups' || activeTab === 'teachers' || activeTab === 'rooms';
  const disableCreate =
    tabNeedsBranches && !branchesLoading && branches.length === 0;

  if (!user?.organizationId) {
    return (
      <Card className="p-8">
        <p className="text-center text-gray-600 dark:text-gray-300">
          Войдите как администратор организации, чтобы управлять справочниками.
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Справочники
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Управляйте группами, преподавателями, аудиториями и предметами вашей организации
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(tabConfig) as TabType[]).map((tab) => {
          const Icon = tabConfig[tab].icon;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
                activeTab === tab
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{tabConfig[tab].label}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold',
                  activeTab === tab
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
                )}
              >
                {counts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <Button variant="primary" onClick={handleOpenCreate} disabled={disableCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </div>

          {tabNeedsBranches && branches.length === 0 && !branchesLoading && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Добавьте хотя бы один филиал, чтобы создавать записи в этом разделе.
            </p>
          )}

          {tabError && (
            <p className="text-sm text-red-600 dark:text-red-400">{tabError}</p>
          )}

          {tabLoading ? (
            <p className="text-gray-500 dark:text-gray-400">Загрузка...</p>
          ) : (
            <>
              {activeTab === 'groups' && (
                <GroupsTable
                  data={groups}
                  searchQuery={searchQuery}
                  onEdit={handleOpenEdit}
                  onDelete={(item) => handleDelete('groups', item)}
                />
              )}
              {activeTab === 'teachers' && (
                <TeachersTable
                  data={teachers}
                  searchQuery={searchQuery}
                  onEdit={handleOpenEdit}
                  onDelete={(item) => handleDelete('teachers', item)}
                />
              )}
              {activeTab === 'rooms' && (
                <RoomsTable
                  data={rooms}
                  searchQuery={searchQuery}
                  onEdit={handleOpenEdit}
                  onDelete={(item) => handleDelete('rooms', item)}
                />
              )}
              {activeTab === 'subjects' && (
                <SubjectsTable
                  data={subjects}
                  searchQuery={searchQuery}
                  onEdit={handleOpenEdit}
                  onDelete={(item) => handleDelete('subjects', item)}
                />
              )}
            </>
          )}
        </div>
      </Card>

      {modalState && (
        <Modal
          isOpen={!!modalState}
          onClose={handleCloseModal}
          title={
            modalState.item
              ? `Редактировать ${tabConfig[modalState.tab].label.slice(0, -1)}`
              : `Создать ${tabConfig[modalState.tab].label.slice(0, -1)}`
          }
          size="lg"
        >
          {modalState.tab === 'groups' && (
            <GroupForm
              branches={branches}
              isSubmitting={isSaving}
              error={saveError}
              initialData={modalState.item}
              onSubmit={handleModalSubmit}
              onCancel={handleCloseModal}
            />
          )}
          {modalState.tab === 'teachers' && (
            <TeacherForm
              branches={branches}
              isSubmitting={isSaving}
              error={saveError}
              initialData={modalState.item}
              onSubmit={handleModalSubmit}
              onCancel={handleCloseModal}
            />
          )}
          {modalState.tab === 'rooms' && (
            <RoomForm
              branches={branches}
              isSubmitting={isSaving}
              error={saveError}
              initialData={modalState.item}
              onSubmit={handleModalSubmit}
              onCancel={handleCloseModal}
            />
          )}
          {modalState.tab === 'subjects' && (
            <SubjectForm
              isSubmitting={isSaving}
              error={saveError}
              initialData={modalState.item}
              onSubmit={handleModalSubmit}
              onCancel={handleCloseModal}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

// Groups Table
interface TableProps<T> {
  data: T[];
  searchQuery: string;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

function GroupsTable({ data, searchQuery, onEdit, onDelete }: TableProps<Group>) {
  const filtered = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.faculty.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="overflow-x-auto">
      <table className="table-minimal">
        <thead>
          <tr>
            <th>Название</th>
            <th>Курс</th>
            <th>Факультет</th>
            <th>Студентов</th>
            <th className="w-32">Действия</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((group: Group) => (
            <tr key={group.id}>
              <td className="font-medium">{group.name}</td>
              <td>{group.course}</td>
              <td className="text-sm text-gray-600 dark:text-gray-400">{group.faculty}</td>
              <td>{group.studentCount}</td>
              <td>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(group)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(group)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title="Группы не найдены"
          description="Попробуйте изменить параметры поиска"
        />
      )}
    </div>
  );
}

// Teachers Table
function TeachersTable({ data, searchQuery, onEdit, onDelete }: TableProps<Teacher>) {
  const filtered = data.filter(
    (item) =>
      `${item.lastName} ${item.firstName} ${item.middleName ?? ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="overflow-x-auto">
      <table className="table-minimal">
        <thead>
          <tr>
            <th>ФИО</th>
            <th>Кафедра</th>
            <th>Предпочтения</th>
            <th className="w-32">Действия</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((teacher: Teacher) => (
            <tr key={teacher.id}>
              <td className="font-medium">{getTeacherFullName(teacher)}</td>
              <td className="text-sm text-gray-600 dark:text-gray-400">{teacher.department}</td>
              <td>
                {teacher.preferences?.noSaturday && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                    Без субботы
                  </span>
                )}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(teacher)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(teacher)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <EmptyState
          icon={<User className="w-12 h-12" />}
          title="Преподаватели не найдены"
          description="Попробуйте изменить параметры поиска"
        />
      )}
    </div>
  );
}

// Rooms Table
function RoomsTable({ data, searchQuery, onEdit, onDelete }: TableProps<Room>) {
  const filtered = data.filter(
    (item) =>
      item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.building.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const roomTypeRu: Record<Room['type'], string> = {
    lecture: 'Лекционная',
    computer: 'Компьютерный класс',
    laboratory: 'Лаборатория',
    regular: 'Обычная',
  };

  return (
    <div className="overflow-x-auto">
      <table className="table-minimal">
        <thead>
          <tr>
            <th>Номер</th>
            <th>Корпус</th>
            <th>Тип</th>
            <th>Вместимость</th>
            <th className="w-32">Действия</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((room: Room) => (
            <tr key={room.id}>
              <td className="font-medium font-mono">{room.number}</td>
              <td>{room.building}</td>
              <td className="text-sm text-gray-600 dark:text-gray-400">{roomTypeRu[room.type]}</td>
              <td>{room.capacity}</td>
              <td>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(room)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(room)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <EmptyState
          icon={<MapPin className="w-12 h-12" />}
          title="Аудитории не найдены"
          description="Попробуйте изменить параметры поиска"
        />
      )}
    </div>
  );
}

// Subjects Table
function SubjectsTable({ data, searchQuery, onEdit, onDelete }: TableProps<Subject>) {
  const filtered = data.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="overflow-x-auto">
      <table className="table-minimal">
        <thead>
          <tr>
            <th>Название</th>
            <th>Часов</th>
            <th className="w-32">Действия</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((subject: Subject) => (
            <tr key={subject.id}>
              <td className="font-medium">{subject.name}</td>
              <td>{subject.hours}</td>
              <td>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(subject)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(subject)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <EmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title="Предметы не найдены"
          description="Попробуйте изменить параметры поиска"
        />
      )}
    </div>
  );
}

interface BaseFormProps {
  isSubmitting: boolean;
  error: string;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

interface GroupFormProps extends BaseFormProps {
  branches: Branch[];
  initialData?: Group | null;
}

function GroupForm({ branches, initialData, onSubmit, onCancel, isSubmitting, error }: GroupFormProps) {
  const [formState, setFormState] = useState({
    branchId: initialData?.branchId || branches[0]?.id || '',
    name: initialData?.name || '',
    course: initialData?.course?.toString() || '1',
    faculty: initialData?.faculty || '',
    studentCount: initialData?.studentCount?.toString() || '25',
  });

  useEffect(() => {
    setFormState({
      branchId: initialData?.branchId || branches[0]?.id || '',
      name: initialData?.name || '',
      course: initialData?.course?.toString() || '1',
      faculty: initialData?.faculty || '',
      studentCount: initialData?.studentCount?.toString() || '25',
    });
  }, [initialData, branches]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      branchId: formState.branchId,
      name: formState.name,
      faculty: formState.faculty,
      course: Number(formState.course),
      studentCount: Number(formState.studentCount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Филиал *</label>
        <select
          value={formState.branchId}
          onChange={(e) => setFormState((prev) => ({ ...prev, branchId: e.target.value }))}
          className={inputClass}
          required
        >
          <option value="" disabled>
            Выберите филиал
          </option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Название группы *</label>
        <input
          className={inputClass}
          value={formState.name}
          onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Курс *</label>
          <input
            type="number"
            min={1}
            max={6}
            className={inputClass}
            value={formState.course}
            onChange={(e) => setFormState((prev) => ({ ...prev, course: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Студентов *</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={formState.studentCount}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, studentCount: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Факультет *</label>
        <input
          className={inputClass}
          value={formState.faculty}
          onChange={(e) => setFormState((prev) => ({ ...prev, faculty: e.target.value }))}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );
}

interface TeacherFormProps extends BaseFormProps {
  branches: Branch[];
  initialData?: Teacher | null;
}

function TeacherForm({
  branches,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: TeacherFormProps) {
  const [formState, setFormState] = useState({
    branchId: initialData?.branchId ?? '',
    lastName: initialData?.lastName ?? '',
    firstName: initialData?.firstName ?? '',
    middleName: initialData?.middleName ?? '',
    department: initialData?.department ?? '',
    noSaturday: initialData?.preferences?.noSaturday ?? false,
  });

  useEffect(() => {
    setFormState({
      branchId: initialData?.branchId ?? '',
      lastName: initialData?.lastName ?? '',
      firstName: initialData?.firstName ?? '',
      middleName: initialData?.middleName ?? '',
      department: initialData?.department ?? '',
      noSaturday: initialData?.preferences?.noSaturday ?? false,
    });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      branchId: formState.branchId || undefined,
      lastName: formState.lastName,
      firstName: formState.firstName,
      middleName: formState.middleName || undefined,
      department: formState.department,
      noSaturday: formState.noSaturday,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Филиал</label>
        <select
          value={formState.branchId}
          onChange={(e) => setFormState((prev) => ({ ...prev, branchId: e.target.value }))}
          className={inputClass}
        >
          <option value="">Все филиалы</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Фамилия *</label>
          <input
            className={inputClass}
            value={formState.lastName}
            onChange={(e) => setFormState((prev) => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Имя *</label>
          <input
            className={inputClass}
            value={formState.firstName}
            onChange={(e) => setFormState((prev) => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Отчество</label>
          <input
            className={inputClass}
            value={formState.middleName}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, middleName: e.target.value }))
            }
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Кафедра *</label>
        <input
          className={inputClass}
          value={formState.department}
          onChange={(e) => setFormState((prev) => ({ ...prev, department: e.target.value }))}
          required
        />
      </div>

      <label className="inline-flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={formState.noSaturday}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, noSaturday: e.target.checked }))
          }
          className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
        Не ставить занятия по субботам
      </label>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );
}

interface RoomFormProps extends BaseFormProps {
  branches: Branch[];
  initialData?: Room | null;
}

function RoomForm({ branches, initialData, onSubmit, onCancel, isSubmitting, error }: RoomFormProps) {
  const [formState, setFormState] = useState({
    branchId: initialData?.branchId ?? '',
    number: initialData?.number ?? '',
    building: initialData?.building ?? '',
    type: (initialData?.type ?? 'regular') as Room['type'],
    capacity: initialData?.capacity?.toString() ?? '30',
  });

  useEffect(() => {
    setFormState({
      branchId: initialData?.branchId ?? '',
      number: initialData?.number ?? '',
      building: initialData?.building ?? '',
      type: (initialData?.type ?? 'regular') as Room['type'],
      capacity: initialData?.capacity?.toString() ?? '30',
    });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      branchId: formState.branchId || undefined,
      number: formState.number,
      building: formState.building,
      type: formState.type,
      capacity: Number(formState.capacity),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Филиал</label>
        <select
          value={formState.branchId}
          onChange={(e) => setFormState((prev) => ({ ...prev, branchId: e.target.value }))}
          className={inputClass}
        >
          <option value="">Все филиалы</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Номер *</label>
          <input
            className={inputClass}
            value={formState.number}
            onChange={(e) => setFormState((prev) => ({ ...prev, number: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Корпус *</label>
          <input
            className={inputClass}
            value={formState.building}
            onChange={(e) => setFormState((prev) => ({ ...prev, building: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Тип *</label>
          <select
            value={formState.type}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, type: e.target.value as Room['type'] }))
            }
            className={inputClass}
            required
          >
            <option value="lecture">Лекционная</option>
            <option value="computer">Компьютерный класс</option>
            <option value="laboratory">Лаборатория</option>
            <option value="regular">Обычная</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Вместимость *</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={formState.capacity}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, capacity: e.target.value }))
            }
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );
}

interface SubjectFormProps extends BaseFormProps {
  initialData?: Subject | null;
}

function SubjectForm({ initialData, onSubmit, onCancel, isSubmitting, error }: SubjectFormProps) {
  const [formState, setFormState] = useState({
    name: initialData?.name ?? '',
    hours: initialData?.hours?.toString() ?? '36',
  });

  useEffect(() => {
    setFormState({
      name: initialData?.name ?? '',
      hours: initialData?.hours?.toString() ?? '36',
    });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formState.name,
      hours: Number(formState.hours),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Название *</label>
        <input
          className={inputClass}
          value={formState.name}
          onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Количество часов *</label>
        <input
          type="number"
          min={1}
            className={inputClass}
          value={formState.hours}
          onChange={(e) => setFormState((prev) => ({ ...prev, hours: e.target.value }))}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );
}
