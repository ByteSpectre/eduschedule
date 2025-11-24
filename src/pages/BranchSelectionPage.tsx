import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { ArrowLeft, MapPin, Phone, Mail } from 'lucide-react';
import { getBranchesByOrganization, getOrganizationById } from '../utils/mockOrganizations';
import type { Branch } from '../types/types';

export function BranchSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get('org');
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [organizationName, setOrganizationName] = useState<string>('');

  useEffect(() => {
    if (!orgId) {
      navigate('/');
      return;
    }

    const org = getOrganizationById(orgId);
    if (!org) {
      navigate('/');
      return;
    }

    setOrganizationName(org.name);
    const orgBranches = getBranchesByOrganization(orgId);
    setBranches(orgBranches);
  }, [orgId, navigate]);

  const handleBranchSelect = (branchId: string) => {
    localStorage.setItem('selectedOrganization', orgId!);
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
          {branches.map((branch) => (
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
                    <span>{branch.city}, {branch.address}</span>
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

        {branches.length === 0 && (
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

