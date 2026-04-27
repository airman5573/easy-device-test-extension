import { AddDeviceModal } from './components/AddDeviceModal';
import { DeviceCanvas } from './components/DeviceCanvas';
import { HeaderToolbar } from './components/HeaderToolbar';

export default function App() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-appbg text-slate-300 antialiased" data-ai-id="responsive-lab-app">
      <HeaderToolbar />
      <DeviceCanvas />
      <AddDeviceModal />
    </div>
  );
}
