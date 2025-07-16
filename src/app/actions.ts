"use server";

export const makeGitLabApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const gitLabAccessToken = process.env.GITLAB_ACCESS_TOKEN;
  const BASE_GITLAB_URL = process.env.BASE_GITLAB_URL;

  const url = `${BASE_GITLAB_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${gitLabAccessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Erro GitLab API:", error);
    throw error;
  }
};
