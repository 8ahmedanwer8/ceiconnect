import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();

  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The requested page was not found.</p>
    </div>
  );
}
