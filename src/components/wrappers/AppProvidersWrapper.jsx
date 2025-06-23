import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/context/useAuthContext';
import { LayoutProvider } from '@/context/useLayoutContext';
import { NotificationProvider } from '@/context/useNotificationContext';
import { LoadScript } from '@react-google-maps/api';

const AppProvidersWrapper = ({
  children
}) => {
  return <HelmetProvider>
      <AuthProvider>
        <LayoutProvider>
          <NotificationProvider>
            <LoadScript
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              libraries={['places']}
            >
              {children}
              <ToastContainer theme="colored" />
            </LoadScript>
          </NotificationProvider>
        </LayoutProvider>
      </AuthProvider>
    </HelmetProvider>;
};
export default AppProvidersWrapper;