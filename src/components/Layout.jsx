import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
  console.log('Layout.jsx: Starting render');
  try {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Layout.jsx: Render error:', error);
    return <div>Error rendering layout. Please try refreshing the page.</div>;
  }
}

export default Layout;