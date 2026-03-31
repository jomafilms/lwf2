---
name: Buggy VPS access
description: How to SSH to the VPS and ping Buggy (the review agent) when code is pushed
type: reference
---

**VPS:** `ssh ubuntu@15.204.118.114`

**Ping Buggy (Option A — SSH one-liner):**
```
ssh ubuntu@15.204.118.114 "sudo -u buggy HOME=/home/buggy openclaw agent --message 'Code pushed to REPO on branch BRANCH'"
```

**Option B (not set up yet):** GitHub webhook — ~20-line Node.js handler on VPS + Caddy route. More robust, catches all pushes automatically.
