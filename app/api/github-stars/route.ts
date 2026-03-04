import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site";

const REVALIDATE_SECONDS = 60 * 60 * 6; // 6 hours

function getTemplateRepoSlug(): string {
  // Derive the repo slug from the configured username to avoid hard-coded references
  // Falls back to a safe default if username is missing
  const username = siteConfig.username || "Krishna8665";
  return `${username}/minimal-next-portfolio`;
}

async function getGitHubRepoStars(repo: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const repo = getTemplateRepoSlug();
  const stars = await getGitHubRepoStars(repo);

  return NextResponse.json({
    repo,
    url: `https://github.com/${repo}`,
    stars,
  });
}
