import { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { 
  Plus, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Trash2,
  Search,
  MoreVertical
} from 'lucide-react';
import type { Branch } from '../types/types';
import { cn } from '../utils/cn';

// Mock data
const mockBranches: Branch[] = [
  {
    id: '1',
    organizationId: 'org-1',
    name: 'Главный корпус',
    city: 'Москва',
    address: 'ул. Ленина, д. 1',
    contactEmail: 'main@university.ru',
    contactPhone: '+7 (495) 123-45-67',
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    organizationId: 'org-1',
    name: 'Филиал на Арбате',
    city: 'Москва',
    address: 'ул. Арбат, д. 25',
    contactEmail: 'arbat@university.ru',
    contactPhone: '+7 (495) 234-56-78',
    isActive: true,
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    organizationId: 'org-1',
    name: 'Филиал в Зеленограде',
    city: 'Москва',
    address: 'г. Зеленоград, пл. Юности, д. 2',
    contactEmail: 'zelenograd@university.ru',
    contactPhone: '+7 (495) 345-67-89',
    isActive: false,
    createdAt: new Date('2024-03-10'),
  },
];

export function BranchManagementPage() {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        city: branch.city,
        address: branch.address,
        contactEmail: branch.contactEmail || '',
        contactPhone: branch.contactPhone || '',
        isActive: branch.isActive,
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: '',
        city: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        isActive: true,
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setFormData({
      name: '',
      city: '',
      address: '',
      contactEmail: '',
      contactPhone: '',
      isActive: true,
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название филиала';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Введите город';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Введите адрес';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Некорректный email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (editingBranch) {
      // Update existing branch
      setBranches(prev =>
        prev.map(branch =>
          branch.id === editingBranch.id
            ? { ...branch, ...formData }
            : branch
        )
      );
    } else {
      // Create new branch
      const newBranch: Branch = {
        id: `branch-${Date.now()}`,
        organizationId: 'org-1',
        ...formData,
        createdAt: new Date(),
      };
      setBranches(prev => [...prev, newBranch]);
    }

    handleCloseModal();
  };

  const handleDelete = (branchId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот филиал?')) {
      setBranches(prev => prev.filter(branch => branch.id !== branchId));
      setSelectedBranchId(null);
    }
  };

  const handleToggleActive = (branchId: string) => {
    setBranches(prev =>
      prev.map(branch =>
        branch.id === branchId
          ? { ...branch, isActive: !branch.isActive }
          : branch
      )
    );
    setSelectedBranchId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Управление филиалами
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Добавляйте и управляйте филиалами вашей организации
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => handleOpenModal()}
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить филиал
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск филиалов..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-brand-500 focus:outline-none transition-colors"
          />
        </div>
      </Card>

      {/* Branches Grid */}
      {filteredBranches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBranches.map(branch => (
            <Card key={branch.id} className="p-6 relative">
              {/* Status Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  branch.isActive
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                )}>
                  {branch.isActive ? 'Активен' : 'Неактивен'}
                </span>

                {/* Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => setSelectedBranchId(selectedBranchId === branch.id ? null : branch.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>

                  {selectedBranchId === branch.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10">
                      <button
                        onClick={() => {
                          handleOpenModal(branch);
                          setSelectedBranchId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Редактировать</span>
                      </button>
                      <button
                        onClick={() => handleToggleActive(branch.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {branch.isActive ? 'Деактивировать' : 'Активировать'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-b-xl"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">Удалить</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Info */}
              <div className="space-y-4 mt-2">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {branch.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Создан {branch.createdAt.toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{branch.city}, {branch.address}</span>
                  </div>

                  {branch.contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{branch.contactEmail}</span>
                    </div>
                  )}

                  {branch.contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{branch.contactPhone}</span>
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
            icon={<Building2 className="w-16 h-16" />}
            title={searchQuery ? 'Филиалы не найдены' : 'Нет филиалов'}
            description={searchQuery ? 'Попробуйте изменить запрос' : 'Добавьте первый филиал вашей организации'}
          />
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBranch ? 'Редактировать филиал' : 'Добавить филиал'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Название филиала *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Главный корпус"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* City & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Город *
              </label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Москва"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Адрес *
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="ул. Ленина, д. 1"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="branch@university.ru"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Телефон
              </label>
              <Input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="+7 (495) 123-45-67"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Филиал активен
            </label>
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
              {editingBranch ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

