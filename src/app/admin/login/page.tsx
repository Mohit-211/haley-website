import type { Metadata } from "next";
import { Login } from "./login";

export const metadata: Metadata = { title: "Admin Login — Haley Bettle" };

export default function Page() {
  return <Login />;
}
