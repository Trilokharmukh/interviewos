import { Topics } from "@/components/topics";
import { categories } from "@/content";
export const metadata = { title: "Learning library" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  return (
    <Topics
      key={`${q}-${category}`}
      initialQuery={q ?? ""}
      initialCategory={
        category && categories.includes(category) ? category : "All topics"
      }
    />
  );
}
