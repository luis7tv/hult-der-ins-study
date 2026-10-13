#!/bin/zsh
# Deploys the study guide to Vercel production (project hult-der-ins-study, team luis-7tv-projects).
# First deploy on 13 Oct 2026 was blocked by the Hobby cap of 100 deployments a day; rerun after the reset.
cd "$(dirname "$0")" && vercel --prod --yes --scope luis-7tv-projects
