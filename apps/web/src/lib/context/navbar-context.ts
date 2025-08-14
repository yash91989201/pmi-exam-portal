import { createContext } from "react";

export const NavbarContext = createContext<{ navbarHeight: number }>({
	navbarHeight: 0,
});
