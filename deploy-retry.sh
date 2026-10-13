#!/bin/zsh
# Retries the Vercel production deploy of the study guide until the team's daily deployment cap clears,
# then removes its own launchd agent. Installed 13 Oct 2026 because luis-7tv-projects had hit the Hobby
# limit of 100 deployments a day. Log: deploy-retry.log next to this file.
export PATH="/Users/luisrodriguez/npm-global/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
LABEL="com.luis.hult-der-ins-deploy"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
DIR="$(cd "$(dirname "$0")" && pwd)"
LOG="$DIR/deploy-retry.log"
cd "$DIR" || exit 1

remove_agent() {
  rm -f "$PLIST"
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
}

ATTEMPTS=$(grep -c " attempt" "$LOG" 2>/dev/null || echo 0)
if [ "$ATTEMPTS" -ge 100 ]; then
  echo "$(date '+%F %T') giving up after $ATTEMPTS attempts, removing agent" >> "$LOG"
  remove_agent
  exit 0
fi

echo "$(date '+%F %T') attempt" >> "$LOG"
OUT=$(vercel --prod --yes --scope luis-7tv-projects 2>&1)
echo "$OUT" | tail -4 >> "$LOG"

if echo "$OUT" | grep -q "api-deployments-free-per-day"; then
  exit 0   # still capped, launchd runs this again next interval
fi

if echo "$OUT" | grep -qE "https://[a-z0-9.-]+\.vercel\.app"; then
  echo "$(date '+%F %T') deployed, removing agent" >> "$LOG"
  say "Hult study guide is live" 2>/dev/null
  remove_agent
fi
