# 🚀 Deploy React Frontend to Vercel using GitHub Actions

## 1. Pre-Requisites
- MERN project with `client/` folder (React app)
- Vercel account connected to GitHub
- Vercel Project already created (manual one-time setup)

## 2. Get Vercel Tokens
1. Go to [Vercel Dashboard → Settings → Tokens](https://vercel.com/account/tokens)
2. Generate a Personal Access Token
3. Required credentials:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### 🔍 How to Get ORG_ID & PROJECT_ID
1. Install Vercel CLI:


```sh
npm i -g vercel
vercel login
vercel link
Check generated config:

```

- check the folder .vercel

```bash
cat .vercel/project.json
Output format:

json
{
  "projectId": "prj_xxxxxxx",
  "orgId": "team_xxxxxxx"
}

```
3. Store Secrets in GitHub
Go to GitHub Repo → Settings → Secrets → Actions

Add these secrets:

VERCEL_TOKEN

VERCEL_ORG_ID

VERCEL_PROJECT_ID