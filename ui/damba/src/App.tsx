import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import appConfig from './configs/app.config'
import { OrganizationProvider } from './providers/OrganizationProvider'
import { fetchApplicationsByProject, fetchModulesByApplication, fetchOrganizations, fetchProject } from './services/Organization'
import { ProjectProvider } from './providers/ProjectProvider'
import { ApplicationProvider } from './providers/ApplicationProvider'
import { ModuleProvider } from './providers/ModuleProvider'
import { DialogProvider } from './providers/DialogProvider'
const byPassLogin = appConfig.byPassLogin;

if (appConfig.enableMock) {
    import('./mock')
}

function App() {
    return (
        <Theme>
            <BrowserRouter>
                <AuthProvider>
                    <OrganizationProvider fetchOrganizations={fetchOrganizations} >
                        <ProjectProvider fetchProjectsByUserAndOrg={fetchProject} autoSelectSingle={true} byPassLogin={byPassLogin} >
                            <ApplicationProvider fetchApplicationsByProject={fetchApplicationsByProject} autoSelectSingle={true} byPassLogin={byPassLogin}>
                                <ModuleProvider fetchModulesByApplication={fetchModulesByApplication} byPassLogin={byPassLogin} autoSelectSingle={true} >
                                    <DialogProvider>
                                        <Layout>
                                            <Views />
                                        </Layout>
                                    </DialogProvider>
                                </ModuleProvider>
                            </ApplicationProvider>
                        </ProjectProvider>
                    </OrganizationProvider>
                </AuthProvider>
            </BrowserRouter>
        </Theme>
    )
}

export default App
