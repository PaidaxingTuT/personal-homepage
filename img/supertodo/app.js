const button = document.querySelector("#downloadButton");
const repo = "PaidaxingTuT/SuperTodo";

async function getLatestApkUrl() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/releases/latest`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!response.ok) throw new Error(`GitHub API: ${response.status}`);

    const release = await response.json();
    const apk = release.assets.find((asset) => asset.name.toLowerCase().endsWith(".apk"));
    if (!apk) throw new Error("Latest release has no APK asset");
    return apk.browser_download_url;
  } catch {
    const response = await fetch(`https://data.jsdelivr.com/v1/package/gh/${repo}`);
    if (!response.ok) throw new Error(`jsDelivr API: ${response.status}`);

    const { versions } = await response.json();
    const version = versions[0];
    if (!version) throw new Error("Repository has no published version");
    return `https://github.com/${repo}/releases/download/v${version}/SuperTodo-${version}.apk`;
  }
}

async function loadLatestApk() {
  try {
    button.href = `https://ghfast.top/${await getLatestApkUrl()}`;
  } catch {
    button.href = `https://github.com/${repo}/releases/latest`;
  } finally {
    button.classList.remove("is-loading");
    button.removeAttribute("aria-disabled");
  }
}

loadLatestApk();
