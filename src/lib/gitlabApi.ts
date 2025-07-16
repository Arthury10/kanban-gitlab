import { makeGitLabApiRequest } from "@/app/actions";

interface Project {
  id: number;
  name: string;
  description: string;
  web_url: string;
  path_with_namespace: string;
}

interface Issue {
  iid: number;
  id: number;
  title: string;
  description: string;
  state: string;
  labels: string[];
  assignees: any[];
  created_at: string;
  updated_at: string;
  web_url: string;
  author: {
    name: string;
    username: string;
    avatar_url: string;
  };
}

interface CreateIssueData {
  title: string;
  description?: string;
  labels?: string;
  assignee_ids?: number[];
}

interface UpdateIssueData {
  title?: string;
  description?: string;
  labels?: string;
  state_event?: "close" | "reopen";
}

class GitLabAPI {
  // Buscar projetos do usuário
  async getProjects(): Promise<Project[]> {
    return await makeGitLabApiRequest("/projects?membership=true&per_page=100");
  }

  // Buscar projeto específico
  async getProject(projectId: string): Promise<Project> {
    return await makeGitLabApiRequest(
      `/projects/${encodeURIComponent(projectId)}`
    );
  }

  // Buscar issues de um projeto
  async getIssues(projectId: string): Promise<Issue[]> {
    return await makeGitLabApiRequest(
      `/projects/${encodeURIComponent(projectId)}/issues?per_page=100`
    );
  }

  // Buscar issue específica
  async getIssue(projectId: string, issueIid: number): Promise<Issue> {
    return await makeGitLabApiRequest(
      `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`
    );
  }

  // Criar nova issue
  async createIssue(projectId: string, data: CreateIssueData): Promise<Issue> {
    return await makeGitLabApiRequest(
      `/projects/${encodeURIComponent(projectId)}/issues`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  // Atualizar issue
  async updateIssue(
    projectId: string,
    issueIid: number,
    data: UpdateIssueData
  ): Promise<Issue> {
    return await makeGitLabApiRequest(
      `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  // Deletar issue (fechar)
  async deleteIssue(projectId: string, issueIid: number): Promise<Issue> {
    return this.updateIssue(projectId, issueIid, { state_event: "close" });
  }

  // Reabrir issue
  async reopenIssue(projectId: string, issueIid: number): Promise<Issue> {
    return this.updateIssue(projectId, issueIid, { state_event: "reopen" });
  }
}

const gitlabApi = new GitLabAPI();

export default gitlabApi;
export type { Project, Issue, CreateIssueData, UpdateIssueData };
