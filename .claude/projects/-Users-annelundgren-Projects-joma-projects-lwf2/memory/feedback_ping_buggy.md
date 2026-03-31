---
name: Ping Buggy after every push
description: After every git push, SSH to VPS and notify Buggy so he can review/merge
type: feedback
---

After every `git push`, run this SSH one-liner to notify Buggy:

```
ssh ubuntu@15.204.118.114 "sudo -u buggy HOME=/home/buggy openclaw agent --agent main --message 'Code pushed to lwf2 on branch BRANCH_NAME - BRIEF_DESCRIPTION'"
```

**Why:** Buggy is the review agent on the VPS. He needs to know when code is pushed so he can pull, review, and merge PRs. This is the agreed workflow — local agent pushes, Buggy reviews.

**How to apply:** Every single time you run `git push`, immediately follow it with this SSH command. Replace BRANCH_NAME with the actual branch and BRIEF_DESCRIPTION with a short summary of the changes. Agent ID is `main` (not `buggy`).
