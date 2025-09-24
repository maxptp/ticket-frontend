import LandingPage from "@/components/pages/LandingPage/LandingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket System",
  description: "Ticket System Frontend",
};

export default function Home() {
  return <LandingPage />;
}
