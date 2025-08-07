# GitHub Actions Workflows

## Setup Requirements

Before using these workflows, you need to set up the following secrets in your GitHub repository:

### Required Secrets

1. **NPM_TOKEN**: Your NPM automation token
   - Go to [npmjs.com](https://www.npmjs.com) → Profile → Access Tokens
   - Create a new "Automation" token (not "Publish" - Automation has more permissions)
   - Add it as a repository secret: Settings → Secrets and variables → Actions → New repository secret
   - Name: `NPM_TOKEN`
   - Value: Your token

### Available Workflows

#### Auto Release Workflow (`auto-release.yml`) - **RECOMMENDED**
- **Triggers**: When `package.json` version changes on main branch
- **Purpose**: Automatically publishes to NPM when version is updated
- **Smart tagging**: Detects alpha/beta/rc versions and uses appropriate NPM tags
- **Creates GitHub releases**: Automatic release creation with changelog

#### CI Workflow (`ci.yml`)
- **Triggers**: Push to main, Pull requests
- **Purpose**: Runs tests, linting, type checking, and builds
- **Node versions tested**: 18, 20, 22

#### Manual Publish Workflow (`publish.yml`)
- **Triggers**: 
  - Manual: Via "Actions" tab → "Publish to NPM" → "Run workflow"
  - Legacy: When a GitHub release is published (if you prefer manual releases)
  
- **Manual options**:
  - **Version**: Specify version to publish (optional)
  - **Tag**: NPM dist-tag (latest, beta, alpha, etc.)
  - **Dry run**: Test without actually publishing

## Usage

### Auto Release Process (Recommended) 🚀

1. **Update version and push**:
   ```bash
   pnpm version patch  # 0.1.51 → 0.1.52
   git push origin main --follow-tags
   ```

2. **That's it!** The workflow automatically:
   - Detects the version change
   - Runs tests and builds
   - Publishes to NPM with the right tag
   - Creates a GitHub release

### Smart NPM Tagging
The auto-release workflow automatically chooses NPM tags:
- `1.2.3` → `latest` tag
- `1.2.3-beta.1` → `beta` tag  
- `1.2.3-alpha.1` → `alpha` tag
- `1.2.3-rc.1` → `rc` tag

### Pre-release Example
```bash
pnpm version prerelease --preid=beta  # 0.1.52-beta.0
git push origin main --follow-tags
# → Publishes to NPM with 'beta' tag
# → Users install with: npm install wavo@beta
```

### Alternative: Manual Publishing
1. Go to Actions tab → "Publish to NPM" → "Run workflow"
2. Specify version and options
3. Workflow updates package.json and publishes

### Manual Publishing
1. Go to Actions tab in GitHub
2. Select "Publish to NPM" workflow
3. Click "Run workflow"
4. Fill in options:
   - Version: Leave empty to use current package.json version
   - Tag: `latest` for stable, `beta` for pre-release, etc.
   - Dry run: Check to test without publishing

### Publishing Pre-releases
For beta/alpha releases:
```bash
# Manual workflow with beta tag
Version: 1.2.3-beta.1
Tag: beta
```

Users can then install with:
```bash
npm install wavo@beta
```

## Security Notes

- The NPM token should be an "Automation" token, not a "Publish" token
- Never commit tokens to the repository
- Regularly rotate your NPM tokens
- Use `--no-git-checks` to avoid git tag requirements during automated publishing