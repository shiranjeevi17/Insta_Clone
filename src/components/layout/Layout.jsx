import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import ErrorBoundary from '../common/ErrorBoundary';

export default function Layout({ children, fullBleed = false }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className={`main-content ${fullBleed ? 'full-bleed' : ''}`}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
