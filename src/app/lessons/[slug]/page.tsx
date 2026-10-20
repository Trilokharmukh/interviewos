import { notFound } from "next/navigation";
import { lessons } from "@/content";
import { LessonView } from "@/components/lesson";
export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: lessons.find((l) => l.id === slug)?.title ?? "Lesson not found",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = lessons.find((l) => l.id === slug);
  if (!lesson) notFound();
  return <LessonView key={slug} lesson={lesson} />;
}
