const button = document.querySelector("#downloadButton");
const repo = "PaidaxingTuT/SuperTodo";

async function getLatestApkUrl() {
  // 1. 优先尝试 GitHub REST API（若未被限流且网络正常）
  try {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 3500) : null;
    const response = await fetch(
      `https://api.github.com/repos/${repo}/releases`,
      {
        headers: { Accept: "application/vnd.github+json" },
        signal: controller?.signal,
      },
    );
    if (timer) clearTimeout(timer);
    if (!response.ok) throw new Error(`GitHub API: ${response.status}`);

    const releases = await response.json();
    const release = releases
      .filter((item) => !item.draft && !item.prerelease && item.assets?.some((asset) => asset.name?.toLowerCase().endsWith(".apk")))
      .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))[0];
    if (!release) throw new Error("No release has an APK asset");
    const apk = release.assets.find((asset) => asset.name?.toLowerCase().endsWith(".apk"));
    return apk.browser_download_url;
  } catch (err) {
    // 2. 次选方案：通过 jsDelivr CDN HEAD 请求探测 @latest 解析的版本号（绕过 GitHub 403 限流，实时性高）
    try {
      const jsdRes = await fetch(
        `https://cdn.jsdelivr.net/gh/${repo}@latest/README.md?t=${Date.now()}`,
        { method: "HEAD" },
      );
      const jsdVersion = jsdRes.headers?.get ? jsdRes.headers.get("x-jsd-version") : null;
      if (jsdVersion && /^\d+(?:\.\d+)*$/.test(jsdVersion)) {
        return `https://github.com/${repo}/releases/download/v${jsdVersion}/SuperTodo-${jsdVersion}.apk`;
      }
    } catch {
      // 忽略错误，继续下一级兜底
    }

    // 3. 兜底方案：请求 jsDelivr 历史包版本列表 API
    try {
      const response = await fetch(`https://data.jsdelivr.com/v1/package/gh/${repo}`);
      if (!response.ok) throw new Error(`jsDelivr API: ${response.status}`);

      const { versions } = await response.json();
      const version = versions.find((value) => /(^|\/)v?\d+(?:\.\d+)*$/.test(value));
      if (!version) throw new Error("Repository has no published version");
      const tag = version.startsWith("v") ? version : `v${version}`;
      const filenameVersion = tag.replace(/^v/, "");
      return `https://github.com/${repo}/releases/download/${tag}/SuperTodo-${filenameVersion}.apk`;
    } catch {
      throw new Error("Unable to locate latest APK");
    }
  }
}

async function loadLatestApk() {
  try {
    const apkUrl = await getLatestApkUrl();
    button.href = `https://ghfast.top/${apkUrl}`;
  } catch {
    // 最终兜底：设置直接跳转最新 Release 页面，确保用户总能点击下载
    button.href = `https://github.com/${repo}/releases/latest`;
  } finally {
    button.classList.remove("is-loading");
    button.removeAttribute("aria-disabled");
  }
}

loadLatestApk();
