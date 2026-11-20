const STORAGE_KEY = "agent-roadmap-progress-v3";
const API_ENDPOINT = "./api/progress.php";
const UI_ENDPOINT = "./ui.json";
const STAGES_ENDPOINT = "./stages.json";
const CHECKLIST_ENDPOINT = "./checklist.json";
const COURSES_ENDPOINT = "./courses.json";

const defaultUi = {
  pageTitle: "Agent 学习进度看板",
  brandText: "Agent 学习进度",
  searchAriaLabel: "搜索课程",
  searchPlaceholder: "搜索 LangGraph / RAG / FastAPI...",
  filterAllText: "全部",
  filterTodoText: "未完成",
  filterDoneText: "已完成",
  sideTitleText: "路线导航",
  sideNavAriaLabel: "学习阶段导航",
  heroEyebrowText: "AI Agent Engineer Roadmap",
  heroTitleText: "学习路线",
  heroDescText: "我的Agent学习路线",
  focusLabelText: "主要知识学习路线",
  focusValueText: "LangChain + RAG → FastAPI → LangGraph + Agent",
  focusCaptionText: "学习路线",
  overallLabelText: "总进度",
  doneLabelText: "已完成",
  todoLabelText: "剩余",
  statsItemCaptionText: "个学习项",
  moduleListAriaLabel: "详细学习路线",
  modalCloseAriaLabel: "关闭课程清单",
  modalPhaseDefaultText: "阶段",
  modalTitleDefaultText: "课程清单",
  glyphs: [],
  detailButtonTitle: "查看并勾选课程清单",
  courseButtonLabel: "对应课程",
  courseButtonTitle: "查看对应视频课程",
  detailModalDesc: "具体课程列表",
  courseModalDesc: "课程对应链接",
  courseModalTitleTemplate: "{title}：对应课程",
  taskSummaryLabel: "阶段事项",
  detailSummaryLabel: "课程清单",
  emptyStateText: "没有匹配的阶段或课程。",
  missingCoursesText: "还没有为 {stageId} 配置课程链接。",
  unnamedCourseText: "未命名课程",
  unknownAuthorText: "未填写作者",
  missingLinkText: "未填写链接",
};

const codeRain = document.querySelector("#codeRain");
const sideNav = document.querySelector("#sideNav");
const moduleList = document.querySelector("#moduleList");
const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll("[data-filter]");
const detailModal = document.querySelector("#detailModal");
const modalClose = document.querySelector("#modalClose");
const modalPhase = document.querySelector("#modalPhase");
const modalTitle = document.querySelector("#modalTitle");
const modalDesc = document.querySelector("#modalDesc");
const modalProgressBar = document.querySelector("#modalProgressBar");
const modalProgressText = document.querySelector("#modalProgressText");
const detailList = document.querySelector("#detailList");

const staticTextBindings = {
  pageTitle: document.querySelector("#pageTitle"),
  brandText: document.querySelector("#brandText"),
  heroEyebrowText: document.querySelector("#heroEyebrowText"),
  heroTitleText: document.querySelector("#heroTitleText"),
  heroDescText: document.querySelector("#heroDescText"),
  focusLabelText: document.querySelector("#focusLabelText"),
  focusValueText: document.querySelector("#focusValueText"),
  focusCaptionText: document.querySelector("#focusCaptionText"),
  overallLabelText: document.querySelector("#overallLabelText"),
  doneLabelText: document.querySelector("#doneLabelText"),
  todoLabelText: document.querySelector("#todoLabelText"),
  sideTitleText: document.querySelector("#sideTitleText"),
  filterAllText: document.querySelector("#filterAllText"),
  filterTodoText: document.querySelector("#filterTodoText"),
  filterDoneText: document.querySelector("#filterDoneText"),
};

let progress = readProgress();
let activeFilter = "all";
let currentDetailStageId = null;
let uiText = { ...defaultUi };
let stages = [];
const remoteEnabled = location.protocol !== "file:";

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  saveRemoteProgress();
}

async function loadRemoteProgress() {
  if (!remoteEnabled) {
    return;
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("load_failed");
    const result = await response.json();
    if (result.ok && result.progress && typeof result.progress === "object") {
      progress = result.progress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      renderAll();
    }
  } catch {}
}

async function saveRemoteProgress() {
  if (!remoteEnabled) return;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ progress }),
    });
    if (!response.ok) throw new Error("save_failed");
    await response.json();
  } catch {}
}

function formatTemplate(template, values) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : "",
  );
}

function normalizeStage(stage, index, checklistMap, coursesMap) {
  const checklistConfig = checklistMap?.[stage?.id] || {};
  const title = stage?.title || `未命名阶段 ${index + 1}`;

  return {
    id: stage?.id || `stage-${index + 1}`,
    phase: stage?.phase || `阶段 ${index + 1}`,
    title,
    desc: stage?.desc || "",
    tasks: Array.isArray(checklistConfig.tasks) ? checklistConfig.tasks : [],
    detailsTitle:
      checklistConfig.detailsTitle || `${title} 课程清单`,
    details: Array.isArray(checklistConfig.checklist)
      ? checklistConfig.checklist
      : [],
    courses: Array.isArray(coursesMap?.[stage?.id]) ? coursesMap[stage.id] : [],
  };
}

async function loadJson(endpoint, fallback) {
  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) throw new Error("load_failed");
    return await response.json();
  } catch {
    return fallback;
  }
}

async function loadConfig() {
  const [uiConfig, stageConfig, checklistConfig, coursesConfig] =
    await Promise.all([
      loadJson(UI_ENDPOINT, {}),
      loadJson(STAGES_ENDPOINT, []),
      loadJson(CHECKLIST_ENDPOINT, {}),
      loadJson(COURSES_ENDPOINT, {}),
    ]);

  uiText = {
    ...defaultUi,
    ...(uiConfig && typeof uiConfig === "object" ? uiConfig : {}),
    glyphs: Array.isArray(uiConfig?.glyphs) ? uiConfig.glyphs : defaultUi.glyphs,
  };

  stages = Array.isArray(stageConfig)
    ? stageConfig.map((stage, index) =>
        normalizeStage(stage, index, checklistConfig, coursesConfig),
      )
    : [];
}

function applyStaticUiText() {
  Object.entries(staticTextBindings).forEach(([key, element]) => {
    if (element) {
      element.textContent = uiText[key];
    }
  });

  document.title = uiText.pageTitle;
  searchInput.placeholder = uiText.searchPlaceholder;
  document.querySelector("#searchBox")?.setAttribute("aria-label", uiText.searchAriaLabel);
  sideNav.setAttribute("aria-label", uiText.sideNavAriaLabel);
  moduleList.setAttribute("aria-label", uiText.moduleListAriaLabel);
  modalClose.setAttribute("aria-label", uiText.modalCloseAriaLabel);
  modalPhase.textContent = uiText.modalPhaseDefaultText;
  modalTitle.textContent = uiText.modalTitleDefaultText;
  document.querySelector("#doneCaptionText").textContent = uiText.statsItemCaptionText;
  document.querySelector("#todoCaptionText").textContent = uiText.statsItemCaptionText;
}

function taskId(stageId, index) {
  return `${stageId}__task__${index}`;
}

function detailId(stageId, index) {
  return `${stageId}__detail__${index}`;
}

function getStageById(stageId) {
  return stages.find((stage) => stage.id === stageId);
}

function getStageStats(stage) {
  const taskDone = stage.tasks.filter(
    (_, index) => progress[taskId(stage.id, index)],
  ).length;
  const detailDone = stage.details.filter(
    (_, index) => progress[detailId(stage.id, index)],
  ).length;
  const total = stage.tasks.length + stage.details.length;
  const done = taskDone + detailDone;
  return {
    total,
    done,
    taskTotal: stage.tasks.length,
    taskDone,
    detailTotal: stage.details.length,
    detailDone,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

function getAllIds() {
  return stages.flatMap((stage) => [
    ...stage.tasks.map((_, index) => taskId(stage.id, index)),
    ...stage.details.map((_, index) => detailId(stage.id, index)),
  ]);
}

function renderCodeRain() {
  if (!uiText.glyphs.length) {
    codeRain.innerHTML = "";
    return;
  }

  const count = window.innerWidth < 720 ? 12 : 26;
  codeRain.innerHTML = Array.from({ length: count }, (_, index) => {
    const text = Array.from(
      { length: 8 },
      (_, offset) => uiText.glyphs[(index + offset) % uiText.glyphs.length],
    ).join("   ");
    return `<span class="code-column" style="--delay: -${index * 0.7}s">${text}</span>`;
  }).join("");
}

function renderSideNav() {
  sideNav.innerHTML = stages
    .map((stage) => {
      const stats = getStageStats(stage);
      const isOptional = stage.id === 'stage-8';
      return `
      <a href="#${stage.id}"${isOptional ? ' style="opacity:0.55"' : ''}>
        <strong>${stage.title}</strong>
        <span>${stage.phase} · ${stats.done}/${stats.total}${isOptional ? '（可选）' : ''}</span>
      </a>
    `;
    })
    .join("");
}

function renderStages() {
  moduleList.innerHTML = stages
    .map((stage) => {
      const stats = getStageStats(stage);
      const tasks = stage.tasks
        .map((task, index) => {
          const id = taskId(stage.id, index);
          const checked = Boolean(progress[id]);
          return `
        <label class="task-row ${checked ? "done" : ""}" data-task-row data-done="${checked}" data-text="${task.toLowerCase()}">
          <span class="task-check">
            <input type="checkbox" data-task-id="${id}" data-stage-id="${stage.id}" ${checked ? "checked" : ""} />
            <span class="fake-check">
              <i class="fa-solid fa-check" aria-hidden="true"></i>
            </span>
          </span>
          <span class="task-text">${task}</span>
        </label>
      `;
        })
        .join("");

      return `
      <article class="module-card" id="${stage.id}" data-module-card data-title="${(stage.title + " " + stage.phase + " " + stage.desc + " " + stage.tasks.join(" ")).toLowerCase()}">
        <div class="module-header">
          <div class="module-title">
            <div class="pill-row">
              <button class="phase-pill${stage.id === 'stage-8' ? ' optional' : ''}" type="button" data-open-detail="${stage.id}" title="${uiText.detailButtonTitle}">${stage.phase}</button>
              <button class="phase-pill course-pill" type="button" data-open-courses="${stage.id}" title="${uiText.courseButtonTitle}">${uiText.courseButtonLabel}</button>
            </div>
            <h2>${stage.title}</h2>
            <p>${stage.desc}</p>
          </div>
          <div class="module-meta">
            <span class="module-percent">${stats.percent}%</span>
          </div>
        </div>
        <div class="module-progress"><i style="width:${stats.percent}%"></i></div>
        <div class="stage-summary">
          <span>${uiText.taskSummaryLabel} ${stats.taskDone}/${stats.taskTotal}</span>
          <span>${uiText.detailSummaryLabel} ${stats.detailDone}/${stats.detailTotal}</span>
        </div>
        <div class="task-list">${tasks}</div>
      </article>
    `;
    })
    .join("");

  moduleList.querySelectorAll("[data-task-id]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const checkbox = event.currentTarget;
      progress[checkbox.dataset.taskId] = checkbox.checked;
      if (!checkbox.checked) {
        delete progress[checkbox.dataset.taskId];
      }
      saveProgress();
      const row = checkbox.closest("[data-task-row]");
      row.classList.toggle("done", checkbox.checked);
      row.dataset.done = String(checkbox.checked);
      updateStageCard(checkbox.dataset.stageId);
      renderSideNav();
      updateSummary();
      applyFilters();
    });
  });

  moduleList.querySelectorAll("[data-open-detail]").forEach((button) => {
    button.addEventListener("click", () =>
      openDetail(button.dataset.openDetail),
    );
  });

  moduleList.querySelectorAll("[data-open-courses]").forEach((button) => {
    button.addEventListener("click", () =>
      openCourses(button.dataset.openCourses),
    );
  });
}

function updateStageCard(stageId) {
  const stage = getStageById(stageId);
  const card = moduleList.querySelector(`#${stageId}`);
  if (!stage || !card) return;

  const stats = getStageStats(stage);
  card.querySelector(".module-percent").textContent = `${stats.percent}%`;
  card.querySelector(".module-progress i").style.width = `${stats.percent}%`;
  card.querySelector(".stage-summary").innerHTML = `
    <span>${uiText.taskSummaryLabel} ${stats.taskDone}/${stats.taskTotal}</span>
    <span>${uiText.detailSummaryLabel} ${stats.detailDone}/${stats.detailTotal}</span>
  `;
}

function updateSummary() {
  const allIds = getAllIds();
  const done = allIds.filter((id) => progress[id]).length;
  const total = allIds.length;
  const todo = total - done;
  const percent = total ? Math.round((done / total) * 100) : 0;

  document.querySelector("#overallPercent").textContent = `${percent}%`;
  document.querySelector("#sideProgress").textContent = `${percent}%`;
  document.querySelector("#doneCount").textContent = done;
  document.querySelector("#todoCount").textContent = todo;
  document.querySelector("#overallBar").style.width = `${percent}%`;
  document.querySelector("#sideProgressBar").style.width = `${percent}%`;
}

function applyFilters() {
  const keyword = searchInput.value.trim().toLowerCase();
  const cards = moduleList.querySelectorAll("[data-module-card]");
  let visibleCount = 0;

  cards.forEach((card) => {
    const stage = getStageById(card.id);
    if (!stage) return;

    const titleMatch = card.dataset.title.includes(keyword);
    const detailMatch = stage.details.join(" ").toLowerCase().includes(keyword);
    const rows = card.querySelectorAll("[data-task-row]");
    let rowVisibleCount = 0;

    rows.forEach((row) => {
      const done = row.dataset.done === "true";
      const filterMatch =
        activeFilter === "all" ||
        (activeFilter === "done" && done) ||
        (activeFilter === "todo" && !done);
      const textMatch =
        !keyword ||
        titleMatch ||
        detailMatch ||
        row.dataset.text.includes(keyword);
      const visible = filterMatch && textMatch;
      row.style.display = visible ? "flex" : "none";
      if (visible) rowVisibleCount += 1;
    });

    const cardVisible = rowVisibleCount > 0 || (keyword && detailMatch);
    card.classList.toggle("hidden", !cardVisible);
    if (cardVisible) visibleCount += 1;
  });

  let empty = moduleList.querySelector(".empty-state");
  if (!visibleCount) {
    if (!empty) {
      empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = uiText.emptyStateText;
      moduleList.appendChild(empty);
    }
  } else if (empty) {
    empty.remove();
  }
}

function openDetail(stageId) {
  const stage = getStageById(stageId);
  if (!stage) return;

  currentDetailStageId = stageId;
  modalPhase.textContent = stage.phase;
  modalTitle.textContent = stage.detailsTitle;
  modalDesc.textContent = uiText.detailModalDesc;
  renderDetailList(stage);
  modalProgressBar.parentElement.style.display = "block";
  modalProgressText.style.display = "block";
  detailModal.classList.add("open");
  detailModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function openCourses(stageId) {
  const stage = getStageById(stageId);
  if (!stage) return;

  currentDetailStageId = null;
  modalPhase.textContent = stage.phase;
  modalTitle.textContent = formatTemplate(uiText.courseModalTitleTemplate, {
    title: stage.title,
  });
  modalDesc.textContent = uiText.courseModalDesc;
  modalProgressBar.parentElement.style.display = "none";
  modalProgressText.style.display = "none";
  renderCourseLinks(stage);
  detailModal.classList.add("open");
  detailModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function renderCourseLinks(stage) {
  const courses = Array.isArray(stage.courses) ? stage.courses : [];

  if (!courses.length) {
    detailList.innerHTML = `
      <div class="empty-state">
        ${formatTemplate(uiText.missingCoursesText, { stageId: stage.id })}
      </div>
    `;
    return;
  }

  detailList.innerHTML = `
    <div class="course-link-list">
      ${courses
        .map((course) => {
          const title = course.title || uiText.unnamedCourseText;
          const author = course.author || uiText.unknownAuthorText;
          const link = course.link || "";
          if (!link) {
            return `<div class="course-link disabled"><span>${title}</span><small>${author} · ${uiText.missingLinkText}</small>${course.note ? `<div class="course-note">💡 ${course.note}</div>` : ""}</div>`;
          }
          return `
          <a class="course-link" href="${link}" target="_blank" rel="noopener noreferrer">
            <span>${title}</span>
            <small>${author} · ${link}</small>
            ${course.note ? `<div class="course-note">💡 ${course.note}</div>` : ""}
          </a>
        `;
        })
        .join("")}
    </div>
  `;
}

function renderDetailList(stage) {
  const stats = getStageStats(stage);
  const detailPercent = stats.detailTotal
    ? Math.round((stats.detailDone / stats.detailTotal) * 100)
    : 0;
  modalProgressBar.style.width = `${detailPercent}%`;
  modalProgressText.textContent = `${uiText.detailSummaryLabel} ${stats.detailDone}/${stats.detailTotal}`;

  detailList.innerHTML = stage.details
    .map((item, index) => {
      const id = detailId(stage.id, index);
      const checked = Boolean(progress[id]);
      return `
      <label class="task-row detail-row ${checked ? "done" : ""}" data-detail-row>
        <span class="task-check">
          <input type="checkbox" data-detail-id="${id}" ${checked ? "checked" : ""} />
          <span class="fake-check">
            <i class="fa-solid fa-check" aria-hidden="true"></i>
          </span>
        </span>
        <span class="task-text">${item}</span>
      </label>
    `;
    })
    .join("");

  detailList.querySelectorAll("[data-detail-id]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const checkbox = event.currentTarget;
      progress[checkbox.dataset.detailId] = checkbox.checked;
      if (!checkbox.checked) {
        delete progress[checkbox.dataset.detailId];
      }
      saveProgress();
      checkbox
        .closest("[data-detail-row]")
        .classList.toggle("done", checkbox.checked);
      updateStageCard(stage.id);
      renderSideNav();
      updateSummary();
      renderDetailList(stage);
    });
  });
}

function closeDetail() {
  detailModal.classList.remove("open");
  detailModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  currentDetailStageId = null;
}

function renderAll() {
  renderSideNav();
  renderStages();
  updateSummary();
  applyFilters();
}

async function init() {
  await loadConfig();
  applyStaticUiText();
  renderCodeRain();
  renderAll();
  loadRemoteProgress();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    applyFilters();
  });
});

searchInput.addEventListener("input", applyFilters);

modalClose.addEventListener("click", closeDetail);

detailModal.addEventListener("click", (event) => {
  if (event.target === detailModal) closeDetail();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && detailModal.classList.contains("open")) {
    closeDetail();
  }
});

init();

window.addEventListener("resize", renderCodeRain);
