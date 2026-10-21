#!/usr/bin/env bash
set -euo pipefail

gif_path="$1"
if [ ! -f "$gif_path" ]; then
  echo "Generated GIF does not exist: $gif_path" >&2
  exit 1
fi

asset_branch="preview-assets"
asset_ref="refs/heads/$asset_branch"
publish_attempts=3
tmp_dir="$(mktemp -d)"
ref_file="$(mktemp)"
current_file="$(mktemp)"
cp "$gif_path" "$tmp_dir/preview.gif"
rm -f "$gif_path"

cat > "$tmp_dir/index.html" <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Wakato Preview Assets</title>
  </head>
  <body>
    <img src="./preview.gif" alt="Live Weather Preview">
  </body>
</html>
HTML
cat > "$tmp_dir/package.json" <<'JSON'
{
  "private": true
}
JSON
cat > "$tmp_dir/vercel.json" <<'JSON'
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "installCommand": "",
  "buildCommand": null,
  "outputDirectory": "."
}
JSON

trap 'rm -rf "$tmp_dir" "$ref_file" "$current_file"' EXIT
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

for attempt in $(seq 1 "$publish_attempts"); do
  remote_sha=""
  if git ls-remote --exit-code --heads origin "$asset_branch" > "$ref_file"; then
    if ! git fetch --no-tags --depth=1 origin "+$asset_ref:refs/remotes/origin/$asset_branch"; then
      if [ "$attempt" -lt "$publish_attempts" ]; then
        echo "Could not fetch $asset_branch; retrying (attempt $attempt/$publish_attempts)."
        sleep "$((attempt * 5))"
        continue
      fi
      echo "Failed to fetch the existing asset branch after $publish_attempts attempts." >&2
      exit 1
    fi

    remote_sha="$(git rev-parse "refs/remotes/origin/$asset_branch")"
    assets_changed=false
    for asset in preview.gif index.html package.json vercel.json; do
      if ! git show "$remote_sha:$asset" > "$current_file" 2>/dev/null ||
        ! cmp --silent "$tmp_dir/$asset" "$current_file"; then
        assets_changed=true
        break
      fi
    done

    if [[ "$assets_changed" == false ]]; then
      echo "Published assets are unchanged."
      exit 0
    fi

    publish_branch="publish-preview-assets-$attempt"
    git switch --force-create "$publish_branch" "refs/remotes/origin/$asset_branch"
  else
    ls_remote_status=$?
    if [ "$ls_remote_status" -eq 2 ]; then
      echo "$asset_branch does not exist yet; creating it."
      publish_branch="publish-preview-assets-$attempt"
      git switch --orphan "$publish_branch"
    elif [ "$attempt" -lt "$publish_attempts" ]; then
      echo "Could not inspect the remote asset branch; retrying (attempt $attempt/$publish_attempts)."
      sleep "$((attempt * 5))"
      continue
    else
      echo "Failed to inspect the remote asset branch after $publish_attempts attempts." >&2
      exit 1
    fi
  fi

  git rm -rf . || true
  cp "$tmp_dir/preview.gif" preview.gif
  cp "$tmp_dir/index.html" index.html
  cp "$tmp_dir/package.json" package.json
  cp "$tmp_dir/vercel.json" vercel.json
  git add -- preview.gif index.html package.json vercel.json

  if git diff --cached --quiet; then
    echo "Published assets are unchanged."
    exit 0
  fi

  git commit -m "chore: update live weather gif [skip ci]"
  if git push origin "HEAD:$asset_ref"; then
    echo "Published preview.gif and its static hosting configuration."
    exit 0
  fi

  if [ "$attempt" -lt "$publish_attempts" ]; then
    echo "Asset branch changed during publish; refreshing it before retry."
    sleep "$((attempt * 5))"
  fi
done

echo "Could not publish the weather GIF after $publish_attempts attempts." >&2
exit 1
