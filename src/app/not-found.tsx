import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty">
      <span className="eyebrow">A DIFFERENT PATH</span>
      <h1>This page isn’t in your library.</h1>
      <p>Return to the learning library and find your next concept.</p>
      <Link href="/topics" className="button primary">
        Browse lessons
      </Link>
    </div>
  );
}
