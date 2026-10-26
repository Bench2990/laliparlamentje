import ExperienceLoader from "@/components/experience/ExperienceLoader";

export default function Home() {
  return (
    <main className="experience-shell" aria-label="Az Országház — interaktív háromdimenziós séta">
      <ExperienceLoader />
      <noscript>A háromdimenziós sétához kérjük, engedélyezd a JavaScript használatát.</noscript>
    </main>
  );
}
