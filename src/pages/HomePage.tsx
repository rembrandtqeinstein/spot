import { useState } from 'react';
import { MapView } from '../components/MapView';
import { SpotSidebar } from '../components/SpotSidebar';
import { CreateSpotModal } from '../components/CreateSpotModal';
import { MySpotModal } from '../components/MySpotModal';
import { Navbar } from '../components/Navbar';
import { useSpots } from '../hooks/useSpots';
import { CreateSpotInput } from '../types';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function HomePage() {
  const { spots, loading, createSpot } = useSpots();
  const [showCreate, setShowCreate] = useState(false);
  const [showMySpots, setShowMySpots] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (input: CreateSpotInput) => {
    const spot = await createSpot(input);
    setShowCreate(false);
    navigate(`/spot/${spot.id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar onCreateClick={() => setShowCreate(true)} onMySpots={() => setShowMySpots(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        <div className={`
          absolute inset-y-0 left-0 z-20 w-72 transform transition-transform duration-300
          sm:relative sm:translate-x-0 sm:block
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        `}>
          <SpotSidebar spots={spots} loading={loading} />
        </div>

        <div className="flex-1 relative">
          <MapView spots={spots} />
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="absolute top-3 left-3 z-30 sm:hidden bg-white shadow rounded-full p-2"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="absolute inset-0 z-10 bg-black/30 sm:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </div>

      {showCreate && <CreateSpotModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {showMySpots && <MySpotModal onClose={() => setShowMySpots(false)} />}
    </div>
  );
}
