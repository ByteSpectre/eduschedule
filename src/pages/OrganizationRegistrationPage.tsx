import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Building2, Mail, Lock, MapPin, School } from 'lucide-react';
import type { OrganizationType } from '../types/types';
import { cn } from '../utils/cn';

export function OrganizationRegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'university' as OrganizationType,
    city: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const organizationTypes: { value: OrganizationType; label: string; icon: string }[] = [
    { value: 'university', label: 'Университет', icon: '🎓' },
    { value: 'college', label: 'Колледж', icon: '📚' },
    { value: 'school', label: 'Школа', icon: '🏫' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Введите название организации';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Выберите город';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Симуляция отправки данных
    setTimeout(() => {
      console.log('Registration data:', formData);
      // После успешной регистрации перенаправляем в панель администратора
      navigate('/org-admin/branches');
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Регистрация организации
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Создайте аккаунт для управления расписанием вашего учебного заведения
          </p>
        </div>

        {/* Registration Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Тип учреждения
              </label>
              <div className="grid grid-cols-3 gap-3">
                {organizationTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('type', type.value)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all duration-200',
                      'flex flex-col items-center gap-2',
                      formData.type === type.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <span className="text-3xl">{type.icon}</span>
                    <span className={cn(
                      'text-sm font-medium',
                      formData.type === type.value
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-gray-700 dark:text-gray-300'
                    )}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Название организации
              </label>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => handleChange('organizationName', e.target.value)}
                  placeholder="Например: Московский Государственный Университет"
                  className="pl-12"
                />
              </div>
              {errors.organizationName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.organizationName}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Город
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Москва"
                  className="pl-12"
                />
              </div>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email администратора
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="admin@example.com"
                  className="pl-12"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Минимум 8 символов"
                  className="pl-12"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Подтверждение пароля
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Повторите пароль"
                  className="pl-12"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Регистрируясь, вы подтверждаете, что ознакомлены и согласны с{' '}
                <button type="button" className="text-brand-600 dark:text-brand-400 hover:underline">
                  политикой конфиденциальности
                </button>
                {' '}и{' '}
                <button type="button" className="text-brand-600 dark:text-brand-400 hover:underline">
                  пользовательским соглашением
                </button>
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>
        </Card>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Уже есть аккаунт?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
            >
              Войти
            </button>
          </p>
        </div>

        {/* Student Link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            ← Я студент, хочу посмотреть расписание
          </button>
        </div>
      </div>
    </div>
  );
}

