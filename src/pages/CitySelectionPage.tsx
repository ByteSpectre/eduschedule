import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { MapPin, Search, GraduationCap } from 'lucide-react';
import { cn } from '../utils/cn';
import { fetchCities } from '../api/public';

export function CitySelectionPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cities, setCities] = useState<Awaited<ReturnType<typeof fetchCities>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchCities()
      .then((data) => {
        if (isMounted) {
          setCities(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Не удалось загрузить список городов');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCities = useMemo(() => {
    return cities.filter((city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [cities, searchQuery]);

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    localStorage.setItem('selectedCity', cityName);
    navigate(`/student/organization-selection?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            EduSchedule
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Выберите город вашего университета
          </p>
        </div>

        {/* Search */}
        <Card className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск города..."
              className="w-full pl-12 pr-4 py-3 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>
        </Card>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-6 animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </Card>
            ))}

          {!isLoading &&
            filteredCities.map((city) => (
              <Card
                key={city.id}
                className={cn(
                  'p-6 cursor-pointer transition-all duration-200',
                  'hover:scale-105 hover:shadow-xl',
                  selectedCity === city.id && 'ring-2 ring-brand-500',
                )}
                onClick={() => handleCitySelect(city.name)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-100 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {city.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {city.organizationCount} организаций
                    </p>
                    <div className="space-y-1">
                      {city.sampleOrganizations.map((uni) => (
                        <p key={uni} className="text-sm text-gray-600 dark:text-gray-400">
                          • {uni}
                        </p>
                      ))}
                      {city.organizationCount > city.sampleOrganizations.length && (
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          и ещё {city.organizationCount - city.sampleOrganizations.length}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {!isLoading && error && (
          <Card className="p-12">
            <div className="text-center text-red-500 dark:text-red-400">{error}</div>
          </Card>
        )}

        {!isLoading && !error && filteredCities.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Город не найден</p>
              <p className="text-sm mt-2">Попробуйте изменить запрос</p>
            </div>
          </Card>
        )}

        {/* Organization Registration Link */}
        <div className="text-center">
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

