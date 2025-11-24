import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { ArrowLeft, Search, Building2, GraduationCap, School as SchoolIcon, BookOpen } from 'lucide-react';
import { getOrganizationsByCity, getBranchesByOrganization } from '../utils/mockOrganizations';
import { cities } from '../utils/cities';
import type { Organization, OrganizationType } from '../types/types';
import { cn } from '../utils/cn';

const organizationTypeIcons: Record<OrganizationType, any> = {
  university: GraduationCap,
  college: BookOpen,
  school: SchoolIcon,
};

const organizationTypeLabels: Record<OrganizationType, string> = {
  university: 'Университет',
  college: 'Колледж',
  school: 'Школа',
};

export function OrganizationSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cityId = searchParams.get('city');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<OrganizationType | 'all'>('all');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [cityName, setCityName] = useState<string>('');

  useEffect(() => {
    if (!cityId) {
      navigate('/');
      return;
    }

    const city = cities.find(c => c.id === cityId);
    if (!city) {
      navigate('/');
      return;
    }

    setCityName(city.name);
    const orgs = getOrganizationsByCity(city.name);
    setOrganizations(orgs);
  }, [cityId, navigate]);

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || org.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleOrganizationSelect = (orgId: string) => {
    const branches = getBranchesByOrganization(orgId);
    
    if (branches.length === 1) {
      // Если один филиал - сразу переходим к выбору группы
      localStorage.setItem('selectedOrganization', orgId);
      localStorage.setItem('selectedBranch', branches[0].id);
      navigate('/student/schedule');
    } else if (branches.length > 1) {
      // Если несколько филиалов - показываем выбор
      navigate(`/student/branch-selection?org=${orgId}`);
    } else {
      // Нет филиалов
      alert('У этого учреждения пока нет активных филиалов');
    }
  };

  const organizationTypes: Array<{ value: OrganizationType | 'all'; label: string }> = [
    { value: 'all', label: 'Все' },
    { value: 'university', label: 'Университеты' },
    { value: 'college', label: 'Колледжи' },
    { value: 'school', label: 'Школы' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <div className="text-left">
              <div className="text-xs">Назад к городам</div>
              <div className="font-semibold">{cityName}</div>
            </div>
          </button>
        </div>

        {/* Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Выберите учебное заведение
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {cityName}
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск учебного заведения..."
              className="w-full pl-12 pr-4 py-3 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {organizationTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                  selectedType === type.value
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Organizations Grid */}
        {filteredOrganizations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrganizations.map((org) => {
              const Icon = organizationTypeIcons[org.type];
              const branches = getBranchesByOrganization(org.id);
              
              return (
                <Card
                  key={org.id}
                  className="p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  onClick={() => handleOrganizationSelect(org.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-brand-100 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400">
                          {organizationTypeLabels[org.type]}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {org.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {branches.length} {branches.length === 1 ? 'филиал' : branches.length < 5 ? 'филиала' : 'филиалов'}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Учебные заведения не найдены</p>
              <p className="text-sm mt-2">Попробуйте изменить запрос или фильтр</p>
            </div>
          </Card>
        )}

        {/* Admin Link */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/register')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            Представитель учебного заведения? Зарегистрируйтесь →
          </button>
        </div>
      </div>
    </div>
  );
}

