import type { Organization, Branch } from '../types/types';

export const mockOrganizations: Organization[] = [
  // Москва
  {
    id: 'org-1',
    name: 'МГУ им. Ломоносова',
    email: 'admin@msu.ru',
    type: 'university',
    city: 'Москва',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'org-2',
    name: 'МГТУ им. Баумана',
    email: 'admin@bmstu.ru',
    type: 'university',
    city: 'Москва',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'org-3',
    name: 'РЭУ им. Плеханова',
    email: 'admin@rea.ru',
    type: 'university',
    city: 'Москва',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'org-4',
    name: 'НИУ ВШЭ',
    email: 'admin@hse.ru',
    type: 'university',
    city: 'Москва',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'org-5',
    name: 'Московский колледж информационных технологий',
    email: 'admin@mkit.ru',
    type: 'college',
    city: 'Москва',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'org-6',
    name: 'Школа №1568',
    email: 'admin@school1568.ru',
    type: 'school',
    city: 'Москва',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },

  // Санкт-Петербург
  {
    id: 'org-7',
    name: 'СПбГУ',
    email: 'admin@spbu.ru',
    type: 'university',
    city: 'Санкт-Петербург',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'org-8',
    name: 'ИТМО',
    email: 'admin@itmo.ru',
    type: 'university',
    city: 'Санкт-Петербург',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'org-9',
    name: 'Политех',
    email: 'admin@spbstu.ru',
    type: 'university',
    city: 'Санкт-Петербург',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },

  // Казань
  {
    id: 'org-10',
    name: 'КФУ',
    email: 'admin@kpfu.ru',
    type: 'university',
    city: 'Казань',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'org-11',
    name: 'КНИТУ',
    email: 'admin@kstu.ru',
    type: 'university',
    city: 'Казань',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
];

export const mockBranches: Branch[] = [
  // МГУ
  {
    id: 'branch-1',
    organizationId: 'org-1',
    name: 'Главный корпус МГУ',
    city: 'Москва',
    address: 'Воробьёвы горы, д. 1',
    contactEmail: 'main@msu.ru',
    contactPhone: '+7 (495) 939-10-00',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'branch-2',
    organizationId: 'org-1',
    name: 'Филиал МГУ в Севастополе',
    city: 'Севастополь',
    address: 'ул. Героев Севастополя, д. 7',
    contactEmail: 'sevastopol@msu.ru',
    contactPhone: '+7 (8692) 40-68-68',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },

  // МГТУ им. Баумана
  {
    id: 'branch-3',
    organizationId: 'org-2',
    name: 'Главный корпус',
    city: 'Москва',
    address: '2-я Бауманская ул., д. 5',
    contactEmail: 'main@bmstu.ru',
    contactPhone: '+7 (499) 263-63-91',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },

  // РЭУ им. Плеханова
  {
    id: 'branch-4',
    organizationId: 'org-3',
    name: 'Главный корпус',
    city: 'Москва',
    address: 'Стремянный пер., д. 36',
    contactEmail: 'main@rea.ru',
    contactPhone: '+7 (499) 237-93-49',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },

  // ВШЭ
  {
    id: 'branch-5',
    organizationId: 'org-4',
    name: 'Главный корпус',
    city: 'Москва',
    address: 'ул. Мясницкая, д. 20',
    contactEmail: 'main@hse.ru',
    contactPhone: '+7 (495) 771-32-32',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'branch-6',
    organizationId: 'org-4',
    name: 'Филиал ВШЭ в Санкт-Петербурге',
    city: 'Санкт-Петербург',
    address: 'Кантемировская ул., д. 3',
    contactEmail: 'spb@hse.ru',
    contactPhone: '+7 (812) 644-59-11',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },

  // Колледж
  {
    id: 'branch-7',
    organizationId: 'org-5',
    name: 'Главное здание',
    city: 'Москва',
    address: 'ул. Садовая-Спасская, д. 6',
    contactEmail: 'main@mkit.ru',
    contactPhone: '+7 (495) 607-50-90',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },

  // Школа
  {
    id: 'branch-8',
    organizationId: 'org-6',
    name: 'Основное здание',
    city: 'Москва',
    address: 'Пабло Неруды ул., д. 10',
    contactEmail: 'main@school1568.ru',
    contactPhone: '+7 (495) 942-42-15',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

export const getOrganizationsByCity = (city: string): Organization[] => {
  return mockOrganizations.filter(org => org.city === city && org.isActive);
};

export const getBranchesByOrganization = (organizationId: string): Branch[] => {
  return mockBranches.filter(branch => branch.organizationId === organizationId && branch.isActive);
};

export const getOrganizationById = (id: string): Organization | undefined => {
  return mockOrganizations.find(org => org.id === id);
};

export const getBranchById = (id: string): Branch | undefined => {
  return mockBranches.find(branch => branch.id === id);
};

