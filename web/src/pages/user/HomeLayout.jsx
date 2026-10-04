import Header from "../../components/Header";
import { Outlet } from "react-router-dom";

function HomeLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default HomeLayout;
