# GitHub Pages Deployment Guide

## Quick Fix for 404 Error

Your Library Book Handling System is experiencing a 404 error because GitHub Pages isn't properly configured to serve your built files.

### Solution 1: Deploy Using `build/` Folder (Recommended)

#### Step 1: Make sure your build is up-to-date
```powershell
npm run build
```

#### Step 2: Commit and push the build folder
```powershell
git add build/
git commit -m "Add production build for GitHub Pages"
git push origin main
```

#### Step 3: Configure GitHub Pages
1. Go to your GitHub repository: https://github.com/sajith-24/Library-System
2. Click on **Settings** (gear icon)
3. Scroll down to **Pages** section (on the left sidebar)
4. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `main`
   - **Folder**: Select `/build`
5. Click **Save**
6. Wait 1-2 minutes for GitHub Pages to rebuild
7. Visit https://sajith-24.github.io/Library-System/

---

### Solution 2: Automated Deployment with GitHub Actions (Advanced)

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
          cname: # Leave empty unless using custom domain
```

This will automatically deploy whenever you push to the `main` branch.

---

### Troubleshooting

**Issue: Still getting 404 after configuration**
- Clear your browser cache (Ctrl+Shift+Delete)
- Hard refresh the page (Ctrl+Shift+R)
- Wait a few minutes for GitHub Pages to rebuild
- Check the Pages section in Settings to confirm it says "Your site is live at..."

**Issue: Assets not loading (CSS/JS broken)**
- This is usually because of the `base` path configuration
- Your `vite.config.ts` correctly has: `base: '/Library-System/'`
- Make sure you rebuilt after configuration: `npm run build`

**Issue: Links not working properly**
- React Router needs to handle the base path
- Ensure your routing uses relative paths
- Test from the full URL: https://sajith-24.github.io/Library-System/

---

### Testing Locally Before Deployment

To test if the production build works correctly:

```powershell
npm run build
npm run preview
```

Then visit `http://localhost:4173` to test the built version before pushing to GitHub.

---

### Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [Troubleshoot GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#limits-on-use-of-github-pages)
