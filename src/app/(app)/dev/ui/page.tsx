import { notFound } from "next/navigation";
import { UiShowcase } from "@/features/dev-ui/components/ui-showcase";

export default function UiShowcasePage() { if (process.env.NODE_ENV === "production") notFound(); return <UiShowcase />; }
