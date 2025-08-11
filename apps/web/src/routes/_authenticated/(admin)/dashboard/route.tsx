import { useRef, useState, useEffect } from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AdminNavbar } from "@/components/admin/shared/navbar";
import { NavbarContext } from "@/lib/context/navbar-context";

export const Route = createFileRoute("/_authenticated/(admin)/dashboard")({
  component: AdminLayout,
});

function AdminLayout() {
  const navbarRef = useRef<HTMLElement>(null);
  const [navbarHeight, setNavbarHeight] = useState(0);

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.clientHeight);
    }
  }, []);

  return (
    <NavbarContext.Provider value={{ navbarHeight }}>
      <AdminNavbar ref={navbarRef} />
      <main className="container mx-auto py-6">
        <Outlet />
      </main>
    </NavbarContext.Provider>
  );
}
