import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import appConfig from './configs/app.config'
import { OrganizationProvider } from './providers/OrganizationProvider'
import { fetchApplicationsByProjectId, fetchOrganizations, fetchProject } from './services/Organization'
import { ProjectProvider } from './providers/ProjectProvider'
import { ApplicationProvider } from './providers/ApplicationProvider'
import { ModuleProvider } from './providers/ModuleProvider'
import { DialogProvider } from './providers/DialogProvider'
import { fetchModulesByAppId } from './services/Application'

if (appConfig.enableMock) {
    import('./mock')
}

function App() {
    return (
        <Theme>
            <BrowserRouter>
                <AuthProvider>
                    <OrganizationProvider fetchOrganizations={fetchOrganizations} autoSelectSingle={true}>
                        <ProjectProvider fetchProjectsByUserAndOrg={fetchProject} autoSelectSingle={true} >
                            <ApplicationProvider  fetchApplicationsByProjectId={fetchApplicationsByProjectId} autoSelectSingle={true} >
                                <ModuleProvider fetchModulesByAppId={fetchModulesByAppId} autoSelectSingle={true} >
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
