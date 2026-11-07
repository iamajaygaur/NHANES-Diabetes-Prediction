import { redirect } from "next/navigation";

export default function ExplainRedirectPage() {
  redirect("/project?tab=explain");
}
