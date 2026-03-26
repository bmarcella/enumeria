import { useState } from 'react';
import { HiOutlineUser, HiOutlineOfficeBuilding, HiOutlineUserGroup, HiOutlineShieldCheck, HiOutlineSwitchHorizontal, HiOutlineFolder } from 'react-icons/hi';

type WorkspaceType = 'personal' | 'organization';

type OrgItem = {
  id: string;
  name: string;
  role: string;
  memberCount: number;
  projectCount: number;
};

const WorkspaceView = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceType>('personal');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // TODO: Replace with API calls to /workspace endpoints
  const orgs: OrgItem[] = [];

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-gray-100">Workspace</h2>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'personal'
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <HiOutlineUser /> Personnel
          </button>
          <button
            onClick={() => setActiveTab('organization')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'organization'
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <HiOutlineOfficeBuilding /> Organisation
          </button>
        </div>
      </div>

      {activeTab === 'personal' ? (
        /* Personal workspace */
        <div className="space-y-4">
          <div className="border rounded-lg p-6 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <HiOutlineUser className="text-2xl text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold dark:text-gray-200">Espace Personnel</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vos projets et ressources personnelles</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <HiOutlineFolder className="text-lg" />
                  <span className="text-sm">Projets</span>
                </div>
                <span className="text-2xl font-bold dark:text-gray-200">--</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <HiOutlineShieldCheck className="text-lg" />
                  <span className="text-sm">Role</span>
                </div>
                <span className="text-2xl font-bold dark:text-gray-200">Owner</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Organization workspace */
        <div className="space-y-4">
          {/* Org list */}
          <div className="border rounded-lg dark:border-gray-700">
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold dark:text-gray-200">Vos Organisations</h3>
            </div>
            {orgs.length === 0 ? (
              <div className="p-8 text-center">
                <HiOutlineOfficeBuilding className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Aucune organisation</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Creez ou rejoignez une organisation pour collaborer
                </p>
              </div>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {orgs.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrgId(org.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between ${
                      selectedOrgId === org.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <HiOutlineOfficeBuilding className="text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium dark:text-gray-200">{org.name}</h4>
                        <p className="text-xs text-gray-500">{org.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><HiOutlineUserGroup /> {org.memberCount}</span>
                      <span className="flex items-center gap-1"><HiOutlineFolder /> {org.projectCount}</span>
                      <button className="text-blue-500 hover:text-blue-600">
                        <HiOutlineSwitchHorizontal className="text-lg" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members panel (shown when org is selected) */}
          {selectedOrgId && (
            <div className="border rounded-lg dark:border-gray-700">
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold dark:text-gray-200">Membres</h3>
              </div>
              <div className="p-8 text-center text-sm text-gray-400">
                Chargement des membres...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkspaceView;
