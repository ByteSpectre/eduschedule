import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { ArrowLeft, MapPin, Phone, Mail } from 'lucide-react';
import type { Branch } from '../types/types';
import { fetchPublicBranches } from '../api/public';

export function BranchSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get('org');
  const orgNameParam = searchParams.get('orgName');

  const [branches, setBranches] = useState<Branch[]>([]);
  const organizationName = orgNameParam ? decodeURIComponent(orgNameParam) : '';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId) {
      navigate('/');
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    fetchPublicBranches(orgId)
      .then((data) => {
        if (isMounted) {
          setBranches(
            data.map((branch) => ({
              ...branch,
              createdAt: new Date(branch.createdAt),
            })),
          );
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Не удалось загрузить список филиалов');
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
  }, [orgId, navigate]);

  const handleBranchSelect = (branchId: string) => {
    if (!orgId) return;
    localStorage.setItem('selectedOrganization', orgId);
    localStorage.setItem('selectedBranch', branchId);
    navigate('/student/schedule');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Выберите филиал
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {organizationName}
          </p>
        </div>

        {/* Branches List */}
        <div className="space-y-4">
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-6 animate-pulse space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </Card>
            ))}

          {!isLoading &&
            branches.map((branch) => (
              <Card
                key={branch.id}
                className="p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                onClick={() => handleBranchSelect(branch.id)}
              >
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {branch.name}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {branch.city}, {branch.address}
                      </span>
                    </div>

                    {branch.contactEmail && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span>{branch.contactEmail}</span>
                      </div>
                    )}

                    {branch.contactPhone && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{branch.contactPhone}</span>
                      </div>
                    )}
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

        {!isLoading && !error && branches.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">Нет доступных филиалов</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

