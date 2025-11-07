# Deployment Guide

## Automated Deployment

This project uses GitHub Actions to automatically build and deploy to GitHub Pages whenever you push to the `master` branch.

### How it Works

1. **Push to master** → Triggers the GitHub Actions workflow
2. **Build** → Runs `npm run build:prod` to create optimized production files
3. **Deploy** → Publishes the `dist/` folder to the `gh-pages` branch
4. **Live** → GitHub Pages serves the site from `gh-pages` branch

### Workflow File

The deployment configuration is in `.github/workflows/deploy.yml`

---

## Manual Configuration Steps

These steps need to be completed once to set up GitHub Pages and your custom domain.

### Step 0: Configure GitHub Actions Permissions

**Important**: This must be done first to allow GitHub Actions to deploy to the `gh-pages` branch.

1. Go to https://github.com/AlexOrd/obd-sp/settings/actions
2. Scroll down to **"Workflow permissions"**
3. Select **"Read and write permissions"**
4. Check the box **"Allow GitHub Actions to create and approve pull requests"** (optional, but recommended)
5. Click **Save**

**Note**: The `GITHUB_TOKEN` used in the workflow is automatically provided by GitHub Actions. You don't need to create or configure any tokens manually. This permission setting just allows the workflow to push to your repository.

### Step 1: Enable GitHub Pages

1. Go to https://github.com/AlexOrd/obd-sp/settings/pages
2. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages` / `root`
3. Click **Save**

### Step 2: Configure Custom Domain

1. Still in GitHub Pages settings (same page as Step 1)
2. Under "Custom domain", enter: `vtfk.ordynski.com`
3. Click **Save**
4. Wait a few minutes, then check **"Enforce HTTPS"** (may take 5-10 minutes to become available)

### Step 3: Create Subdomain & Configure DNS in GoDaddy

Since the subdomain `vtfk.ordynski.com` doesn't exist yet, you need to create it by adding a DNS record.

**Action Items:**

1. **Log in to GoDaddy**
   - Go to https://www.godaddy.com
   - Sign in to your account

2. **Navigate to DNS Settings**
   - Click on **My Products** (top menu)
   - Find your domain: **ordynski.com**
   - Click the domain name or **DNS** button next to it
   - Click **Manage DNS** or **DNS**

3. **Add CNAME Record**
   - Scroll to **DNS Records** section
   - Click **Add** or **Add New Record** button
   
4. **Configure the Record**
   - **Type**: Select **CNAME** from dropdown
   - **Name**: Enter `vtfk` (this creates vtfk.ordynski.com)
   - **Value** (or Points to): Enter `alexord.github.io`
   - **TTL**: Select **600 seconds** (or **1 hour**, or leave as default)
   
5. **Save the Record**
   - Click **Save** or **Add Record**
   - Confirm the changes if prompted

6. **Verify the Record**
   - You should see the new CNAME record in your DNS records list:
     ```
     Type    Name    Value               TTL
     CNAME   vtfk    alexord.github.io   600
     ```

**DNS Configuration Summary:**

| Field | Value             |
|-------|-------------------|
| Type  | CNAME             |
| Name  | vtfk              |
| Value | alexord.github.io |
| TTL   | 600 (or default)  |

**Important Notes:**
- DNS changes can take 10-30 minutes to propagate (sometimes up to 48 hours)
- You can check propagation status at https://dnschecker.org
- Don't delete or modify the record after creation

### Step 4: Verify Deployment

After completing the above steps:

1. **Wait for GitHub Actions** (2-5 minutes)
   - Check progress at https://github.com/AlexOrd/obd-sp/actions
   - First deployment should show a green checkmark when complete

2. **Wait for DNS Propagation** (10-30 minutes)
   - DNS changes can take time to propagate globally
   - You can check DNS propagation at https://dnschecker.org

3. **Visit Your Site**
   - Go to https://vtfk.ordynski.com
   - Verify the site loads correctly
   - Check for the HTTPS padlock icon in your browser

---

## Troubleshooting

### Permission Denied / Failed to Push to gh-pages

**Error message**: `refusing to allow a GitHub App to create or update workflow`, `Permission denied`, or `failed to push some refs`

**Solution**:
1. Go to https://github.com/AlexOrd/obd-sp/settings/actions
2. Under "Workflow permissions", select **"Read and write permissions"**
3. Click **Save**
4. Re-run the failed workflow from the Actions tab

### Build Fails in GitHub Actions

- Check the Actions tab for error messages
- Ensure all dependencies are in `package.json`
- Test locally with `npm run build:prod`

### Domain Not Working

- Verify DNS settings in GoDaddy (CNAME record)
- Wait longer for DNS propagation (can take up to 48 hours, usually 30 minutes)
- Check DNS propagation at https://dnschecker.org
- Ensure custom domain is correctly set in GitHub Pages settings

### HTTPS Not Available

- Wait 10-15 minutes after setting custom domain
- GitHub automatically provisions SSL via Let's Encrypt
- If still not available after 1 hour, try removing and re-adding the custom domain

### Site Shows 404

- Ensure `gh-pages` branch exists and contains built files
- Verify GitHub Pages is set to deploy from `gh-pages` branch
- Check that the workflow completed successfully

---

## Deployment Commands

### Manual Local Build
```bash
npm run build:prod
```

### View Workflow Runs
Visit: https://github.com/AlexOrd/obd-sp/actions

### Re-trigger Deployment
Either:
- Push a new commit to `master`
- Go to Actions → Deploy to GitHub Pages → Run workflow (manual trigger)

---

## Project URLs

- **Repository**: https://github.com/AlexOrd/obd-sp
- **GitHub Pages Settings**: https://github.com/AlexOrd/obd-sp/settings/pages
- **Actions**: https://github.com/AlexOrd/obd-sp/actions
- **Live Site**: https://vtfk.ordynski.com

