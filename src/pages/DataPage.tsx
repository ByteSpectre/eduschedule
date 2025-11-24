import { useState } from 'react';
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
  Search
} from 'lucide-react';
import {
  mockGroups,
  mockTeachers,
  mockRooms,
  mockSubjects,
  getTeacherFullName
} from '../utils/mockData';
import type { Group, Teacher, Room, Subject } from '../types/types';
import { cn } from '../utils/cn';

type TabType = 'groups' | 'teachers' | 'rooms' | 'subjects';

const tabs = [
  { id: 'groups' as TabType, label: 'Группы', icon: Users, count: mockGroups.length },
  { id: 'teachers' as TabType, label: 'Преподаватели', icon: User, count: mockTeachers.length },
  { id: 'rooms' as TabType, label: 'Аудитории', icon: MapPin, count: mockRooms.length },
  { id: 'subjects' as TabType, label: 'Предметы', icon: BookOpen, count: mockSubjects.length },
];

export function DataPage() {
  const [activeTab, setActiveTab] = useState<TabType>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: any) => {
    if (confirm(`Вы уверены, что хотите удалить "${item.name || item.number}"?`)) {
      // In real app, delete from backend
      console.log('Delete:', item);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Справочники
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Управление данными: группы, преподаватели, аудитории и предметы
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-semibold',
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <Card>
        <div className="p-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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
            <Button variant="primary" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </div>

          {/* Tables */}
          {activeTab === 'groups' && (
            <GroupsTable
              data={mockGroups}
              searchQuery={searchQuery}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {activeTab === 'teachers' && (
            <TeachersTable
              data={mockTeachers}
              searchQuery={searchQuery}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {activeTab === 'rooms' && (
            <RoomsTable
              data={mockRooms}
              searchQuery={searchQuery}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {activeTab === 'subjects' && (
            <SubjectsTable
              data={mockSubjects}
              searchQuery={searchQuery}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Редактировать` : `Создать`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Форма создания/редактирования будет реализована в полной версии
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary">
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Groups Table
function GroupsTable({ data, searchQuery, onEdit, onDelete }: any) {
  const filtered = data.filter((item: Group) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.faculty.toLowerCase().includes(searchQuery.toLowerCase())
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
function TeachersTable({ data, searchQuery, onEdit, onDelete }: any) {
  const filtered = data.filter((item: Teacher) =>
    `${item.lastName} ${item.firstName} ${item.middleName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.department.toLowerCase().includes(searchQuery.toLowerCase())
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
function RoomsTable({ data, searchQuery, onEdit, onDelete }: any) {
  const filtered = data.filter((item: Room) =>
    item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roomTypeRu: Record<string, string> = {
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
function SubjectsTable({ data, searchQuery, onEdit, onDelete }: any) {
  const filtered = data.filter((item: Subject) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
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

