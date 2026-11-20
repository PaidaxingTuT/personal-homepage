const STORAGE_KEY = "enterprise-knowledge-assistant-progress";
const VERSION_KEY = "enterprise-knowledge-assistant-version";
const tones = ["tone-mint", "tone-sand", "tone-coral", "tone-blue", "tone-violet", "tone-ink"];

const versions = {
  v0: {
    label: "v0 · 大一暑假",
    hero: "Document<br />Assistant API",
    summary: "v0 先用 Python FastAPI、PostgreSQL、Redis 与云端模型完成 AI 文档分析后端。暑假聚焦 API、异步、数据、缓存和结构化分析；v1 起在同一项目中接入 Java Spring Boot + MySQL 业务服务，最终形成 Java + Python 双后端。",
    fact: ["当前版本", "API · 数据库 · 缓存 · LLM"],
    status: "当前目标：做稳 AI 应用后端底座",
    scope: ["云端模型 API", "本阶段不做 RAG", "不做多 Agent"],
    overview: {
      title: "当前在做 v0：后续 RAG 的文档处理底座",
      desc: "用户录入文档后，系统保存原文，后台调用模型生成摘要、关键词与分类。它先解决后端工程问题；RAG 分块与检索会在 v0 稳定后接入同一项目。",
      userTitle: "保存文档，等待分析，查询结构化结果",
      user: ["录入文本，后续再逐步加入文件上传。", "后台任务调用模型完成摘要、关键词和分类。", "把结果和任务状态持久化并提供查询接口。", "用 Redis 缓存高频文档查询。"],
      boundaryTitle: "不把 v0 做成无边界的平台",
      boundary: ["不训练或微调模型，只用云端 API。", "不做多 Agent、MCP、复杂权限系统。", "不做 Embedding、向量库、RAG 分块和检索。", "不追求所有文件格式，先稳定支持文本录入。"],
      flowName: "文档分析数据流",
      flow: [["1", "文档入库", "保存原文与 metadata"], ["2", "创建后台任务", "pending / processing"], ["3", "云端模型分析", "摘要 + 关键词 + 分类"], ["4", "保存并查询", "结果 + Redis 缓存"]],
    },
    tech: [["Python + FastAPI", "AI/Agent 服务：HTTP API、参数校验、异步模型调用。"], ["PostgreSQL", "项目保存文档、分析结果和任务关联数据；本阶段不保存向量。"], ["Redis", "缓存高频查询和短期任务状态。"], ["LangChain + 云端 LLM", "模型调用、Pydantic 结构化输出、失败处理与 LangSmith 调试。"], ["Docker Compose", "一次启动 API、PostgreSQL 与 Redis。"], ["pytest", "测试健康检查、CRUD 与模型失败处理。"]],
    java: [["Spring Boot Controller", "FastAPI Router"], ["DTO / Validation", "Pydantic Schema"], ["Service", "Python Service"], ["JPA / MyBatis", "SQLAlchemy"], ["MySQL", "PostgreSQL"], ["@Async", "BackgroundTasks"], ["Redis", "Redis，概念相同"], ["Vue 页面", "先用 /docs，后续可接 Vue"]],
    stack: {
      title: "v0：从明天开始要用到的技术",
      desc: "先按开发环境、API、数据库、异步、LLM、测试部署的顺序推进。不要看到后续的 RAG、LangGraph、MCP 就提前安装一堆依赖。",
      groups: [
        { title: "1. Python 项目环境", note: "先让项目能被清晰地创建、运行、格式化和配置。", rows: [["Python 3.12+", "python", "虚拟环境、模块导入、类型注解、async/await、异常处理", "不需要学 C 扩展、解释器原理"], ["依赖管理", "uv 或 pip + venv", "创建虚拟环境、安装/锁定依赖、从 pyproject 或 requirements 复现环境", "不同时学 Poetry、Conda、多套包管理器"], ["配置", "python-dotenv / .env", "读取 DATABASE_URL、REDIS_URL、MODEL_API_KEY，密钥不提交 Git", "不需要配置中心或 K8s Secret"], ["代码质量", "ruff", "格式化、基础 lint、修复明显未使用变量和导入", "暂不追求复杂静态分析规则"]] },
        { title: "2. HTTP 与 FastAPI", note: "这部分相当于你熟悉的 Spring Boot Web 层。", rows: [["Web 框架", "fastapi", "Router、路径参数、Query、Body、状态码、异常处理、依赖注入", "暂不做认证、分页框架、插件体系"], ["开发服务器", "uvicorn", "本地启动、--reload、端口冲突排查、生产时不使用 reload", "不需要 Gunicorn 调优"], ["数据校验", "pydantic v2", "BaseModel、必填/默认字段、嵌套模型、响应模型、ValidationError", "不需要深挖所有 validator 技巧"], ["HTTP 客户端", "httpx", "async 调外部模型接口、timeout、异常、重试边界", "不需要爬虫框架"]] },
        { title: "3. PostgreSQL 与 ORM", note: "你会 MySQL 基础，重点迁移到 PostgreSQL + SQLAlchemy 的项目写法。", rows: [["关系数据库", "PostgreSQL 16", "建表、CRUD、JOIN、索引、事务、JSONB、EXPLAIN 基础", "不学主从、分库分表、存储过程"], ["ORM", "SQLAlchemy 2", "Model、Session、基本查询、插入/更新/删除、连接 URL", "先不学复杂关系映射和高级事件"], ["迁移", "Alembic", "生成并执行 migration；理解为什么不能手改线上表", "不需要多环境迁移策略"], ["驱动", "psycopg 或 asyncpg", "理解数据库驱动在 SQLAlchemy URL 中的作用", "只选一个驱动，不要混用"]] },
        { title: "4. Redis、异步与任务", note: "先解决缓存和长耗时模型调用，不引入真正消息队列。", rows: [["缓存", "redis-py", "String、Hash、TTL、get/set/delete；更新文档后清理缓存", "不学 Cluster、Sentinel、Lua、Streams"], ["异步语法", "asyncio", "await、并发的基本概念、timeout、取消；不要在 async 接口里做阻塞 I/O", "不写复杂协程调度器"], ["后台任务", "FastAPI BackgroundTasks", "创建任务、更新状态、失败捕获、状态查询", "暂不接 Celery、Kafka、RabbitMQ"], ["任务状态", "Redis + PostgreSQL", "Redis 放短期状态，PostgreSQL 放最终分析结果", "不把 Redis 当永久数据库"]] },
        { title: "5. 云端 LLM 与结构化输出", note: "这里是 v0 的 AI 增量：分析文档，不做检索和 Agent。", rows: [["模型接入", "langchain / langchain-openai", "OpenAI-compatible base_url、model、API Key、invoke/stream", "不学本地模型部署和微调"], ["Prompt", "ChatPromptTemplate", "系统指令、用户文本、输出要求；控制输入长度", "不追求提示词花活或 CoT 展示"], ["结构化结果", "Pydantic + with_structured_output", "summary、keywords、category 的 schema；字段缺失时处理失败", "不用脆弱正则解析 JSON"], ["可观测性", "LangSmith", "查看输入、输出、耗时、token 和报错 trace", "不做企业级多租户观测平台"]] },
        { title: "6. 测试、容器与协作", note: "让别人能复现，也是你从 Java 项目经验迁移到 Python 项目的关键。", rows: [["单元/接口测试", "pytest + pytest-asyncio", "fixture、mock、TestClient；覆盖健康检查、CRUD、模型失败", "暂不追求覆盖率指标"], ["容器", "Docker + Compose", "Dockerfile、环境变量、端口、volume、api + postgres + redis 联动", "不学 Kubernetes"], ["版本管理", "Git + GitHub", "分支、提交、.gitignore、README、.env.example", "不急着刷开源贡献"], ["Linux 运行", "ssh / docker compose logs", "看日志、重启容器、检查端口、检查环境变量", "不做复杂运维自动化"]] },
      ],
    },
    plan: {
      title: "大一暑假：六个阶段完成 v0",
      desc: "你不需要会大型 Python 项目才开始。每一步都先写可运行的最小代码，再逐步替换内存数据和同步逻辑。",
      phases: [["FastAPI 与 HTTP", ["学习路由、状态码、请求/响应模型与 Swagger。", "理解 async def、await、超时和非阻塞请求。", "写 GET /health 与内存版文档 CRUD。"], "浏览器可在 /docs 调用 API。"], ["项目结构与测试", ["拆分 API、Schema、Service、Database 和测试目录。", "学习 Pydantic 校验、统一异常与环境变量读取。", "为一个函数和两个接口编写 pytest。"], "代码不再全堆在 main.py。"], ["PostgreSQL 与数据", ["创建 documents 与 analyses 两张表。", "练习 CRUD、索引、事务和 SQLAlchemy 查询。", "把内存版 CRUD 替换成数据库实现。"], "重启 API 后文档和结果仍存在。"], ["Redis 与后台处理", ["缓存文档详情或列表，并设置 TTL。", "用 BackgroundTasks 处理模型分析。", "让任务状态经历 pending、processing、completed、failed。"], "长耗时分析不阻塞普通查询。"], ["云端 LLM 分析", ["调用兼容 OpenAI 格式的云端模型。", "用 Pydantic 获取摘要、关键词和分类。", "用 LangSmith 看一次成功与一次失败 trace。"], "分析结果可查询，失败有明确错误信息。"], ["Docker 与服务器运行", ["编写 Dockerfile 和 Docker Compose。", "本机启动 API、PostgreSQL 与 Redis。", "部署到 Linux 服务器并查看容器日志。"], "他人可按 README 复现项目。"]],
    },
    build: { title: "先完成一条可观察的分析流", desc: "v0 只有一条主流程：保存文档 → 创建任务 → 调模型分析 → 保存结果 → 查询结果。每步都能独立检查，适合练后端基础。", core: "Document Service", branches: [["database", "fa-solid fa-database", "PostgreSQL"], ["cache", "fa-solid fa-layer-group", "Redis"], ["llm", "fa-solid fa-wand-magic-sparkles", "Cloud LLM"]], doing: ["文档录入、CRUD 与任务状态查询", "摘要、关键词、分类的结构化输出", "异步分析任务、数据库持久化与 Redis 缓存", "模型调用失败、超时和异常日志"], later: ["PDF OCR、Embedding、向量库和 RAG", "复杂重排、混合检索和多租户权限", "用户登录、权限和支付", "LangGraph、MCP 与多 Agent"] },
    apiIntro: "先只支持 title + content。保存后发起异步分析，结构化结果可查询；文件解析、分块与问答会在后续 RAG 迭代再加入。",
    api: [["get", "GET", "/health", "健康检查", '{"status":"ok"}'], ["post", "POST", "/documents", "创建文档", '{"title":"...","content":"..."}'], ["get", "GET", "/documents", "文档列表", "支持 limit 与 offset"], ["get", "GET", "/documents/{id}", "文档详情", "优先从 Redis 读取缓存"], ["delete", "DELETE", "/documents/{id}", "删除文档", "同步清理对应缓存"], ["post", "POST", "/documents/{id}/analyze", "发起异步分析", "返回 task_id"], ["get", "GET", "/tasks/{task_id}", "查询任务状态", "pending / processing / completed / failed"], ["get", "GET", "/documents/{id}/analysis", "获取分析结果", "摘要、关键词、分类、模型名"]],
    dataIntro: "v0 先用 PostgreSQL 保存 Python AI 服务的文档分析数据，短生命周期缓存和任务状态写 Redis。它是双后端项目的学习起点；v1 接入 Java 后，用户、权限和业务元数据转由 Java + MySQL 负责。",
    schema: ["documents", "- id: UUID, primary key", "- title: VARCHAR(200)", "- content: TEXT", "- status: VARCHAR(20)", "- created_at: TIMESTAMPTZ", "", "analyses", "- id: UUID, primary key", "- document_id: UUID, foreign key", "- summary: TEXT", "- keywords: JSONB", "- category: VARCHAR(80)", "- model_name: VARCHAR(100)"],
    tree: ["document-assistant-api/", "|- app/", "|  |- main.py", "|  |- api/documents.py", "|  |- schemas/documents.py", "|  |- models/documents.py", "|  |- services/analysis.py", "|  |- database.py", "|  `- config.py", "|- tests/", "|- Dockerfile", "|- docker-compose.yml", "|- .env.example", "`- README.md"],
    deploy: { desc: "前提是服务器为 Linux、拥有 SSH 与 Docker 权限，并允许开放应用端口。项目使用云端模型，不需要 GPU。", local: ["创建项目与 Python 虚拟环境，准备 .env。", "用 Docker Compose 启动 PostgreSQL 和 Redis。", "运行 FastAPI，访问 http://127.0.0.1:8000/docs。", "先用 Swagger 验证接口，再运行 pytest。"], server: ["SSH 登录，确认 Docker 与 Docker Compose 可用。", "克隆仓库，在服务器写入真实的 .env。", "使用 Compose 后台构建并启动，开放 API 或反向代理端口。", "用 docker compose logs -f 查看日志，用 /health 验证。"], localCmd: ["cp .env.example .env", "docker compose up -d postgres redis", "uvicorn app.main:app --reload", "pytest"], serverCmd: ["git clone <your-repo-url>", "cd document-assistant-api", "cp .env.example .env", "docker compose up -d --build", "docker compose ps"] },
    acceptance: { desc: "每项都能自己演示、解释和复现，就完成 v0；不需要现在就掌握 RAG 或 Agent。", items: [["本地启动", "API、PostgreSQL、Redis 可正常运行，/docs 可访问。"], ["数据闭环", "文档可以创建、查询、删除，重启服务后数据仍存在。"], ["模型闭环", "后台任务可生成结构化摘要、关键词和分类，并保存结果。"], ["缓存可见", "文档详情或列表经过 Redis 缓存，删除或更新时能失效。"], ["测试可跑", "至少覆盖健康检查、创建文档和模型服务的失败处理。"], ["服务器可演示", "Docker Compose 能在服务器启动，日志、健康检查和环境变量可说明。"]] },
    next: ["v0 完成后，才加 RAG", "按 <b>Loader → 文本切分 → Embedding → pgvector → 检索 → 引用回答</b> 的顺序，在同一项目上递增能力。不要重新开一个新项目。"],
  },
  v1: {
    label: "v1 · 大二上",
    hero: "RAG<br />Knowledge Base",
    summary: "在同一项目中形成双后端：Java Spring Boot + MySQL 负责用户、权限、文档业务元数据和业务 API；Python FastAPI 负责 Loader、切分、Embedding、RAG 与 PostgreSQL + pgvector。目标是回答问题时能找出证据，而不是让模型凭记忆编答案。",
    fact: ["当前版本", "文档处理 · 向量检索 · 带来源问答"],
    status: "当前目标：让文档可被检索并可验证地回答",
    scope: ["RAG 是本阶段核心", "先选 pgvector", "不做 LangGraph"],
    overview: { title: "v1：把文档变成可检索的知识库", desc: "v0 保存的是完整文档；v1 把文档清洗为带 metadata 的 Chunk，并使用同一个 Embedding 模型将 Chunk 与问题编码成向量。提问时只将相关证据送给模型。", userTitle: "上传资料，提问，并看到答案来自哪里", user: ["支持文本、Markdown，逐步加入可解析 PDF。", "异步完成清洗、切分、Embedding 与索引。", "问题经检索后得到回答和文档/页码来源。", "无可靠证据时明确回答不知道。"], boundaryTitle: "先解决可验证检索，不堆检索花活", boundary: ["只使用一个向量存储：PostgreSQL + pgvector。", "先做相似度检索与 metadata 过滤，再考虑 rerank。", "不急着做复杂 OCR、混合检索或多租户权限。", "不把 LangGraph 或 Agent 混进 RAG 调试阶段。"], flowName: "RAG 入库与问答数据流", flow: [["1", "加载与清洗", "Document + metadata"], ["2", "切分向量化", "Chunk + Embedding"], ["3", "相似度检索", "Top-k 相关证据"], ["4", "带来源回答", "上下文 + LLM"]] },
    tech: [["Java Spring Boot + MySQL", "业务服务：用户、角色/权限、文档元数据与传统 CRUD API。"], ["Python FastAPI", "AI 服务：文档入库任务、检索、回答与异步模型调用。"], ["LangChain Loaders", "读取 Text、Markdown、CSV、JSON 与 PDF，统一为 Document。"], ["Embedding API", "将文档 Chunk 与用户问题映射到同一向量空间。"], ["PostgreSQL + pgvector", "Python RAG 服务专用：保存向量和 metadata，执行相似度检索与过滤。"], ["Redis", "两服务共用的缓存、会话/短期状态与任务状态，使用清晰 key 前缀。"], ["LangSmith + 小评测集", "记录检索结果，分析 Bad Case，不凭感觉调参数。"]],
    java: [["文件上传 + ETL", "Loader + 清洗 + 切分入库 Pipeline"], ["全文检索索引", "向量索引 + 相似度检索"], ["搜索结果高亮", "返回 Chunk 来源、页码与片段"], ["DAO 查询条件", "metadata 过滤与 document_id 范围"], ["缓存查询结果", "Redis 缓存重复问题或文档详情"], ["集成测试数据", "标注问题集与期望来源"], ["Spring Service 分层", "ingest_service / retrieval_service / answer_service"], ["Vue 检索页", "可选：上传、聊天、来源展示"]],
    stack: {
      title: "v1：在 v0 基础上新增的 RAG 技术",
      desc: "保留 v0 的 FastAPI、PostgreSQL、Redis、Docker 和测试。这里只学习让资料可检索的新增部分，先只选 pgvector 作为向量存储。",
      groups: [
        { title: "1. 文档读取与清洗", note: "目标是把不同输入统一为带来源信息的 Document。", rows: [["LangChain Loaders", "langchain-community", "TextLoader、CSVLoader、JSONLoader、PyPDFLoader；理解 page_content 与 metadata", "不要一次支持几十种格式"], ["JSON 查询", "jq", "JSONLoader 的 jq_schema；从嵌套 JSON 取正确记录", "不需要学习完整 jq 语言"], ["PDF 处理", "pypdf / PyPDFLoader", "普通可复制文字 PDF 的读取、页码 metadata、失败记录", "扫描 PDF OCR 放到后续选修"], ["清洗", "自写 Python 函数", "删除空白噪声、规范标题、保存 source/page/document_id", "先不做复杂 NLP 清洗"]] },
        { title: "2. 切分与 Embedding", note: "切分决定检索证据的颗粒度；Embedding 让问题和 Chunk 可比较。", rows: [["文本切分", "langchain-text-splitters", "RecursiveCharacterTextSplitter、chunk_size、chunk_overlap、按标题切分思路", "不同时比较十种 splitter"], ["嵌入模型", "云端 Embeddings API", "文档和查询同模型、同维度；记录模型名和维度", "不训练 embedding 模型"], ["向量基础", "余弦相似度", "理解向量相近代表语义相近，不需要手推矩阵", "不研究 ANN 算法论文"], ["Chunk metadata", "JSONB", "保存 document_id、chunk_index、title、page、更新时间", "不做复杂知识图谱"]] },
        { title: "3. pgvector 与检索", note: "将向量放进熟悉的 PostgreSQL，而不是额外维护一套数据库。", rows: [["向量扩展", "pgvector", "CREATE EXTENSION、VECTOR(n)、距离运算符、向量索引概念", "不同时学 Milvus、Chroma 的全部 API"], ["ORM 集成", "pgvector-python + SQLAlchemy", "定义 embedding 列、写入向量、执行相似度查询", "不追求框架封装魔法"], ["检索", "自写 retrieval service", "Top-k、相似度阈值、document_id 过滤、去重", "先不做分片和亿级索引"], ["缓存", "redis-py", "缓存文档详情或重复问题结果，设计 TTL 和失效", "不缓存不稳定的模型答案作为唯一真相"]] },
        { title: "4. RAG 回答与评估", note: "RAG 的关键不是模型回答得漂亮，而是答案是否有证据。", rows: [["RAG Prompt", "ChatPromptTemplate", "插入 context、要求来源、无证据时拒答、限制引用范围", "不拼接整篇文档"], ["可选重排", "reranker API", "理解 rerank 在初步召回后的用途；有 Bad Case 再接", "不把 rerank 设成前置任务"], ["评测集", "JSON/CSV + pytest", "整理至少 20 个问题、期望来源、实际来源和备注", "不依赖单一自动评分"], ["RAGAS", "ragas", "了解 faithfulness、context precision 等辅助指标", "不为跑分而跑分"]] },
      ],
    },
    plan: { title: "大二上：六个阶段完成 v1 RAG", desc: "v1 的难点不是调用向量库，而是能观察每个 Chunk、每次检索和每个错误答案来自哪里。每完成一层都用少量真实文档验证。", phases: [["Loader 与 metadata", ["用现有 JSON/CSV 练习 Document、page_content 和 metadata。", "加入 TextLoader 与 PyPDFLoader，记录文件名、页码、标题。", "把解析失败文档记录为可查询状态。"], "能解释一份文档如何变成多个 Document。"], ["清洗与切分", ["先用 RecursiveCharacterTextSplitter。", "对 Markdown/PDF 比较不同 chunk_size 与 overlap。", "抽样检查 Chunk 是否缺标题、断句或混入噪声。"], "每个 Chunk 可追溯回原始文档。"], ["Embedding 与 pgvector", ["选择一个云端 Embedding 模型。", "创建 chunks 表和 vector 索引。", "写入、删除和重建索引都与 document_id 关联。"], "问题和 Chunk 可在数据库中计算相似度。"], ["检索接口", ["实现 /documents/{id}/index 与任务状态。", "实现 Top-k、相似度阈值和 metadata 过滤。", "输出检索到的 Chunk 供调试，不只看最终答案。"], "能看见为什么命中或没命中。"], ["RAG 问答", ["实现 /chat：问题向量化、检索、上下文拼接、模型回答。", "Prompt 要求引用来源和无证据拒答。", "了解 rerank 的作用，先不强制接入。"], "回答包含来源且不依赖整个文档上下文。"], ["评估与服务化", ["整理至少 20 个真实问题和期待来源。", "记录命中、错误、延迟与 token 成本。", "更新 Docker Compose、README 和演示数据。"], "能讲清一次 RAG Bad Case 如何定位和修复。"]] },
    build: { title: "分清 Java 业务边界与 Python RAG 边界", desc: "Java 服务管理身份、权限、文档元数据和传统业务 API；Python 服务负责入库、Chunk、向量检索与回答。Redis 共用但用前缀隔离；MySQL 不保存向量，pgvector 不承担传统业务表。", core: "Java Business API + Python RAG", branches: [["database", "fa-solid fa-database", "MySQL + PostgreSQL/pgvector"], ["cache", "fa-solid fa-layer-group", "Shared Redis"], ["llm", "fa-solid fa-wand-magic-sparkles", "Embedding + LLM"]], doing: ["Java 用户、权限、文档元数据 API", "Python Loader、清洗、切分与 metadata", "Embedding、pgvector、相似度检索", "/chat 带来源回答与检索 Bad Case 记录"], later: ["复杂 rerank、混合检索和大规模索引优化", "复杂 OCR 与所有文件格式", "LangGraph Agent、MCP 与多 Agent", "模型微调与本地推理"] },
    apiIntro: "保留 v0 的文档 CRUD；新增索引和问答接口。先保证单文档、少量文档场景清楚可调试，再考虑批量导入。",
    api: [["get", "GET", "/health", "健康检查", '{"status":"ok"}'], ["post", "POST", "/documents", "创建文档", '{"title":"...","content":"..."}'], ["post", "POST", "/documents/{id}/index", "异步切分与索引", "返回 task_id"], ["get", "GET", "/tasks/{task_id}", "索引任务状态", "pending / processing / completed / failed"], ["get", "GET", "/documents/{id}/chunks", "调试文档 Chunk", "Chunk、metadata、索引状态"], ["post", "POST", "/chat", "RAG 问答", '{"question":"...","document_ids":[]}'], ["get", "GET", "/conversations/{id}", "查看问答与来源", "answer、sources、created_at"]],
    dataIntro: "v1 起明确双库职责：Java/MySQL 保存用户、权限、文档元数据等传统业务数据；Python/PostgreSQL + pgvector 保存 Chunk、Embedding、检索与问答数据。两侧通过 document_id 关联，删除文档时由业务流程触发向量清理。",
    schema: ["documents", "- id: UUID, primary key", "- title: VARCHAR(200)", "- content: TEXT", "", "chunks", "- id: UUID, primary key", "- document_id: UUID, foreign key", "- content: TEXT", "- chunk_index: INTEGER", "- metadata: JSONB", "- embedding: VECTOR(n)", "", "conversations", "- id: UUID, primary key", "- question: TEXT", "- answer: TEXT", "- sources: JSONB"],
    tree: ["enterprise-knowledge-assistant/", "|- app/", "|  |- api/documents.py", "|  |- api/chat.py", "|  |- services/ingest.py", "|  |- services/retrieval.py", "|  |- services/answer.py", "|  |- models/document.py", "|  |- models/chunk.py", "|  `- prompts/rag.py", "|- tests/", "|- evals/questions.json", "|- docker-compose.yml", "`- README.md"],
    deploy: { desc: "Docker Compose 中的 PostgreSQL 需要使用 pgvector 镜像。模型和 Embedding 都走云端 API，服务器仍不需要 GPU。", local: ["为 PostgreSQL 选择 pgvector 镜像并创建扩展。", "运行数据库迁移，创建 chunks 和 conversations 表。", "先索引少量测试文档，再在 /docs 调用 /chat。", "每次改切分或 Prompt 后都运行问题集。"], server: ["在服务器拉取新版本并备份 v0 数据库。", "更新 .env 中的 Embedding 模型与维度配置。", "docker compose up -d --build 后观察索引任务日志。", "只开放 API 端口，数据库和 Redis 保持容器网络内。"], localCmd: ["docker compose up -d postgres redis", "alembic upgrade head", "uvicorn app.main:app --reload", "python -m app.scripts.index_demo", "pytest"], serverCmd: ["git pull", "cp .env.example .env  # 首次部署", "docker compose up -d --build", "docker compose logs -f api"] },
    acceptance: { desc: "v1 的完成标准不是能回答一次，而是你能看到 Chunk、来源和失败案例，并能解释一次检索为何失败。", items: [["可重建索引", "文档新增、更新、删除后能正确重建或清理对应 Chunk。"], ["可观察 Chunk", "能查看 Chunk 内容、metadata、文档归属和顺序。"], ["检索可解释", "能输出 Top-k 证据和相似度，解释一次命中逻辑。"], ["回答有来源", "每个答案返回文档名、页码或 Chunk 片段。"], ["无证据拒答", "检索不足时模型不编造答案。"], ["有评测记录", "至少 20 条问题、来源期望和 Bad Case 记录。"]] },
    next: ["v1 稳定后，才用 LangGraph 编排 Agent", "先把 <b>RAG 问答封装为工具</b>，再引入 State、循环、工具选择、持久化和人工审批。不要先做多 Agent。"],
  },
  v2: {
    label: "v2 · 大二寒假",
    hero: "LangGraph<br />Agent",
    summary: "保持 Java Spring Boot + MySQL 业务服务，并将 Python FastAPI 中的 v1 RAG 变成 LangGraph Agent 的一个工具。重点不是让模型自己想，而是把状态、停止条件、失败分支和人工审批设计清楚。",
    fact: ["当前版本", "LangGraph · Tools · Memory · HITL"],
    status: "当前目标：做可靠的单 Agent 工作流",
    scope: ["单 Agent 优先", "RAG 作为工具", "先不做 MCP"],
    overview: { title: "v2：给 RAG 加上可控的 Agent 工作流", desc: "v1 只能直接回答问题；v2 让 Agent 根据状态决定是否检索、是否调用工具、是否重试或请求人工确认。所有决策都受最大步数、Checkpointer 和权限边界约束。", userTitle: "提出任务，看到 Agent 的状态与关键确认", user: ["Agent 先判断是否需要检索知识库。", "必要时调用 RAG、受控查询或摘要工具。", "高风险工具调用会中断并等待用户审批。", "同一 thread_id 可以恢复会话和执行状态。"], boundaryTitle: "先做好单 Agent，不为多 Agent 而多 Agent", boundary: ["不使用多个 Agent 处理一个简单任务。", "不让模型无限循环或直接拥有写入权限。", "不把短期 checkpoint 和长期记忆混为一谈。", "不接 MCP，先使用本地定义且可测试的工具。"], flowName: "LangGraph Agent 状态流", flow: [["1", "读取状态", "消息 + thread_id"], ["2", "选择工具", "RAG 或受控工具"], ["3", "执行与校验", "结果 / 错误 / 重试"], ["4", "回复或中断", "answer / approval"]] },
    tech: [["Java Spring Boot + MySQL", "业务服务继续提供用户身份、权限与传统业务数据。"], ["LangGraph", "Python Agent 服务定义 State、Node、Edge、条件路由、循环和中断。"], ["ToolNode / @tool", "将 RAG 与其他能力封装为输入输出明确的工具。"], ["PostgreSQL", "Python 服务存储 Chunk、向量与 Checkpointer，不承担 Java 业务表。"], ["Redis", "双服务共用缓存和短期状态，使用 key 前缀隔离。"], ["SSE / Streaming", "向前端输出 token、状态更新和审批提示。"], ["LangSmith + pytest", "查看 Agent 轨迹，为工具失败与循环边界写回归测试。"]],
    java: [["状态机 / 工作流引擎", "LangGraph StateGraph"], ["策略模式", "条件路由与工具选择函数"], ["Saga / 事务补偿", "中断、恢复和副作用工具的幂等性"], ["Session", "thread_id + Checkpointer"], ["Service 接口", "Tool schema：输入、输出、异常"], ["WebSocket/SSE 推送", "Agent token 与状态流"], ["审批流", "interrupt + resume"], ["集成测试", "Agent trajectory 回归用例"]],
    stack: {
      title: "v2：在 v1 基础上新增的 LangGraph 技术",
      desc: "RAG 服务保持不动，把它包装成工具。LangGraph 只负责编排状态和控制流；不要把图、工具、数据库操作和 Prompt 写成一大段代码。",
      groups: [
        { title: "1. LangGraph 图与状态", note: "相当于显式写出 Agent 的状态机。", rows: [["图框架", "langgraph", "StateGraph、START、END、add_node、add_edge、compile", "不急着学习子图、多 Agent"], ["状态类型", "TypedDict / Pydantic", "messages、question、tool_result、status 等字段；节点只返回变更", "不把数据库 session 塞进 State"], ["Reducer", "add_messages 等 reducer", "理解多轮消息/并行更新如何合并", "不手写复杂并发 reducer"], ["控制流", "conditional_edges / Command", "条件路由、循环上限、错误分支、主动退出", "不让 Agent 无限重试"]] },
        { title: "2. 工具与 RAG 接入", note: "工具要像 Java Service 接口一样有明确输入、输出和异常。", rows: [["工具定义", "@tool / ToolNode", "工具 description、args_schema、返回值与异常格式", "不让工具直接接收任意自然语言"], ["RAG 工具", "retrieval_service", "把 v1 检索问答封装为独立工具，先单测再接 Agent", "不在节点中复制整套 RAG 代码"], ["工具保护", "wrap_tool_call", "捕获异常、超时、空结果和 fallback", "不吞掉错误然后假装成功"], ["上下文", "Runtime / config", "区分 State、运行时依赖、用户身份和数据库连接", "不把所有对象放在全局变量"]] },
        { title: "3. 记忆、持久化与中断", note: "会话续聊、恢复执行和人工审批都依赖这一层。", rows: [["短期记忆", "messages + thread_id", "同一会话的消息如何随图运行保存", "不再新建 ConversationBufferMemory"], ["检查点", "langgraph-checkpoint", "InMemorySaver 跑通、get_state/history 查看状态", "不一开始研究 time travel 细节"], ["数据库持久化", "langgraph-checkpoint-postgres", "PostgreSQL Checkpointer、恢复同一 thread_id", "不混淆业务表和 checkpoint 表"], ["人工介入", "interrupt / Command(resume)", "approve、reject、edit；副作用工具前中断", "不自动执行高风险操作"]] },
        { title: "4. 流式与评估", note: "让用户看到过程，也让你自己能定位 Agent 为什么失败。", rows: [["流式", "stream / astream", "区分 messages token、updates 状态和 custom 事件", "不需要上 WebSocket，SSE 足够"], ["API 输出", "FastAPI StreamingResponse", "把 Agent 流式事件转换为 SSE，前端/CLI 正确消费", "不在浏览器存完整敏感状态"], ["轨迹", "LangSmith", "查看节点、模型、工具调用顺序和耗时", "不做复杂数据仓库"], ["回归测试", "pytest + 固定 case", "成功、工具失败、审批拒绝、循环终止四类用例", "不追求全自动 Agent 打分平台"]] },
      ],
    },
    plan: { title: "大二寒假：六个阶段完成 v2 Agent", desc: "每个图节点先写成普通 Python 函数并单测，再放入图中。不要一开始把 Prompt、工具、路由和数据库写在一个节点里。", phases: [["图与状态", ["用 TypedDict 定义 messages、question、tool_result 等状态。", "理解 reducer 如何合并并行或多轮消息。", "实现一个没有 LLM 的简单状态图。"], "能解释 Node、Edge、State 和 superstep。"], ["RAG 工具化", ["将 v1 检索问答拆成可调用工具。", "明确工具输入、输出和异常格式。", "让工具函数可脱离 Agent 单独测试。"], "Agent 不直接操作数据库查询细节。"], ["路由与循环", ["根据问题选择直接回答或检索。", "设置最大步数、停止条件和失败分支。", "处理工具超时、空结果和模型工具参数错误。"], "Agent 不会无限调用工具。"], ["会话与恢复", ["先使用内存 Checkpointer。", "再接 PostgreSQL Checkpointer 和 thread_id。", "查看一次历史状态并恢复执行。"], "中断后可以继续同一会话。"], ["人工介入与流式", ["对写入、发送或高成本操作加入 interrupt。", "实现 approve / reject / edit 后 resume。", "区分 token stream 与状态 stream。"], "用户能看到并控制关键工具调用。"], ["轨迹评估", ["记录工具调用成功率、循环次数和失败类型。", "为常见问题写 Agent 回归用例。", "在服务器部署 v2 并保留运行日志。"], "能复盘一次 Agent 错误路径。"]] },
    build: { title: "把工具、状态和副作用明确拆开", desc: "图负责编排，工具负责执行，Checkpointer 负责恢复。模型只能提出工具调用请求；真正的副作用由受控工具和审批节点执行。", core: "LangGraph State", branches: [["database", "fa-solid fa-database", "PostgreSQL Checkpointer"], ["cache", "fa-solid fa-book-open", "RAG Tool"], ["llm", "fa-solid fa-screwdriver-wrench", "Controlled Tools"]], doing: ["RAG 工具、状态定义和条件路由", "最大步数、错误分支与工具 fallback", "thread_id、Checkpointer 与恢复执行", "interrupt 审批、流式状态和轨迹测试"], later: ["MCP 外部工具接入", "多 Agent、Supervisor 和复杂子图", "自动执行高风险写入或发送操作", "长期记忆的复杂召回策略"] },
    apiIntro: "v2 保留 v1 的 /chat 作为基础能力，并新增 Agent 调用、流式输出和中断恢复接口。工具请求和审批结果必须能关联 thread_id。",
    api: [["post", "POST", "/agent/invoke", "同步执行 Agent", '{"message":"...","thread_id":"..."}'], ["post", "POST", "/agent/stream", "流式执行 Agent", "SSE：token、update、interrupt"], ["post", "POST", "/agent/resume", "恢复中断的 Agent", '{"thread_id":"...","decision":"approve"}'], ["get", "GET", "/agent/threads/{id}", "查看会话状态", "messages、checkpoint、当前状态"], ["get", "GET", "/agent/history/{id}", "查看检查点历史", "用于调试与恢复"], ["post", "POST", "/chat", "保留 RAG 问答", "作为 Agent 可调用工具的基础接口"]],
    dataIntro: "Java/MySQL 继续管理用户、权限和业务文档元数据；Python/PostgreSQL + pgvector 管理 Chunk、向量、Agent 状态、审批记录和工具审计。LangGraph 的持久化表由 Python 服务的 Checkpointer 管理。",
    schema: ["business tables", "- documents / chunks / conversations", "", "agent_threads", "- thread_id: VARCHAR, primary key", "- user_id: VARCHAR, optional", "- created_at: TIMESTAMPTZ", "", "tool_audits", "- id: UUID, primary key", "- thread_id: VARCHAR", "- tool_name: VARCHAR(100)", "- input: JSONB", "- outcome: VARCHAR(20)", "", "approval_events", "- id: UUID, primary key", "- thread_id: VARCHAR", "- decision: VARCHAR(20)", "- reason: TEXT"],
    tree: ["enterprise-knowledge-assistant/", "|- app/", "|  |- graph/state.py", "|  |- graph/nodes.py", "|  |- graph/routing.py", "|  |- graph/workflow.py", "|  |- tools/rag.py", "|  |- tools/document.py", "|  |- api/agent.py", "|  `- services/approval.py", "|- tests/agent/", "|- evals/agent_cases.json", "`- docker-compose.yml"],
    deploy: { desc: "v2 仍可使用 Docker Compose 和云端模型。服务器需要可靠的 PostgreSQL 持久化与日志保存，但不需要 GPU。", local: ["安装 LangGraph 依赖，先运行内存 Checkpointer 示例。", "为每个图节点写函数级测试。", "切换 PostgreSQL Checkpointer 后测试同一 thread_id 恢复。", "使用 /agent/stream 观察 SSE 事件。"], server: ["备份 v1 数据和环境变量。", "迁移 Checkpointer 相关表，确认数据库连接池。", "部署后用固定 Agent case 做 smoke test。", "保留容器日志和 LangSmith trace，便于复盘。"], localCmd: ["docker compose up -d postgres redis", "uvicorn app.main:app --reload", "pytest tests/agent", "curl -N http://127.0.0.1:8000/agent/stream"], serverCmd: ["git pull", "docker compose up -d --build", "docker compose logs -f api", "curl https://<domain>/health"] },
    acceptance: { desc: "v2 的完成标准是可控，而不是看起来很智能。每次工具调用、循环终止和人工审批都应能解释。", items: [["工具可单测", "RAG 和其他工具可独立调用，并能模拟失败。"], ["循环受控", "最大步数、停止条件和超时分支生效。"], ["状态可恢复", "同一 thread_id 可查看检查点并恢复中断。"], ["审批有效", "高风险工具必须 approve / reject 后才继续。"], ["流式清楚", "前端或 curl 能区分 token、状态和 interrupt。"], ["有轨迹用例", "至少记录成功、工具失败、审批拒绝三类轨迹。"]] },
    next: ["v2 稳定后，再通过 MCP 接入外部工具", "先用 <b>MCP 标准化工具边界</b>，再补认证、审计、观测、测试和部署。多 Agent 仍然是可选项。"],
  },
  v3: {
    label: "v3 · 大二下",
    hero: "MCP Agent<br />Service",
    summary: "在 Java Spring Boot + MySQL 业务服务与 Python FastAPI RAG/Agent 服务协作的基础上接入 MCP 外部工具，并补齐安全、观测、测试和部署。这是最终用于项目展示与简历复盘的双后端收口版本。",
    fact: ["当前版本", "MCP · Security · Eval · Deployment"],
    status: "当前目标：把能力做成可演示的完整服务",
    scope: ["MCP 工具接入", "安全和审计", "不强制多 Agent"],
    overview: { title: "v3：通过 MCP 让 Agent 安全地使用外部能力", desc: "v3 不改变 v1/v2 的核心数据流，而是在工具层加入 MCP Client/Server。重点是明确工具权限、输入校验、人工审批、审计记录和可观测性。", userTitle: "在知识问答之外，使用受控外部工具完成任务", user: ["Agent 可以先检索知识库，再调用受控 MCP 工具。", "读取、写入、发送等操作按风险等级处理。", "用户可以看到工具名称、参数摘要与审批状态。", "服务端记录调用结果、失败原因和执行时间。"], boundaryTitle: "工具标准化不等于给模型无限权限", boundary: ["只接入 1-2 个可控 MCP 工具，不扫公网工具市场。", "敏感凭据只保存在服务端环境变量。", "副作用工具必须经过审批或权限校验。", "不为了炫技强行做多 Agent 或复杂微服务。"], flowName: "MCP 工具调用数据流", flow: [["1", "Agent 决策", "是否需要外部能力"], ["2", "权限与审批", "参数 + 风险等级"], ["3", "MCP 调用", "Client → Server → Tool"], ["4", "审计与回复", "结果 + 日志 + Answer"]] },
    tech: [["Java Spring Boot + MySQL", "业务服务负责身份、权限、业务元数据与对外传统 API。"], ["Python FastAPI + LangGraph", "AI 服务负责 RAG、Agent 编排、工具调用和记忆。"], ["MCP Client / Server", "将工具以统一协议暴露和调用，理解 Tool、Resource、Prompt 的职责。"], ["FastMCP", "快速构建参数明确、可测试的 MCP Server。"], ["Redis", "双服务共享缓存、会话/短期状态与任务状态。"], ["认证与权限", "Java 业务权限与 Python 工具白名单、风险分级、人工审批协作。"], ["OpenTelemetry + LangSmith", "关联请求、检索、模型、工具、错误和耗时。"], ["GitHub Actions + pytest", "每次改动运行 Java 与 Python 的关键测试。"]],
    java: [["Feign / WebClient", "MCP Client 调用远程能力"], ["Spring Boot Starter", "MCP Server 暴露标准化工具"], ["RBAC / 过滤器", "工具权限、参数校验和审批中间层"], ["审计日志", "tool_audits + trace_id"], ["Actuator + APM", "健康检查、OpenTelemetry、LangSmith"], ["JUnit + CI", "pytest + GitHub Actions"], ["Vue 管理页", "可选：聊天、引用、审批与工具调用展示"], ["生产发布", "Docker Compose、Nginx、HTTPS、备份"]],
    stack: {
      title: "v3：在 v2 基础上新增的 MCP 与工程化技术",
      desc: "这一阶段才收口安全、观测、自动化测试和服务器发布。目标是让现有 RAG/Agent 可演示、可复现、可审计，而不是搭一个虚假的平台。",
      groups: [
        { title: "1. MCP 协议与工具服务", note: "MCP 是外部工具的标准接入方式，不是万能 Agent 框架。", rows: [["协议核心", "mcp", "Client、Server、Tool、Resource、Prompt 各自职责", "不需要背协议全部字段"], ["Server 实现", "FastMCP", "定义工具名、description、参数 schema、返回值和错误", "先不做工具市场或动态插件加载"], ["传输方式", "stdio / Streamable HTTP", "本地用 stdio 跑通；理解 HTTP 适合远程服务", "SSE 只理解场景，不同时维护多种实现"], ["Client 接入", "LangGraph + MCP client", "把 MCP 工具接入 Agent，观察选择、传参、结果回填", "不允许模型自由连接未知 Server"]] },
        { title: "2. 安全、权限与审计", note: "模型只提出请求，权限系统决定是否真的执行。", rows: [["身份与密钥", "API Key / .env", "服务端保存密钥、用户请求携带身份、密钥不进 Prompt", "不自建复杂 OAuth 平台"], ["权限分级", "自定义 policy 函数", "只读、低风险写入、高风险写入；工具白名单", "不把所有权限交给模型"], ["审批", "LangGraph interrupt", "高风险工具在执行前 approve/reject；保存审批理由", "不做无人值守外部写入"], ["审计", "PostgreSQL JSONB", "记录 trace_id、tool_name、输入摘要、结果、耗时和失败", "不把密码或完整敏感正文写日志"]] },
        { title: "3. 观测、质量与 CI", note: "这部分让你能用证据回答“项目可靠吗”。", rows: [["Tracing", "LangSmith", "关联模型、RAG、Agent、MCP 调用；查看错误轨迹", "不搭自研追踪平台"], ["指标", "OpenTelemetry SDK", "请求数、延迟、错误、工具成功率、token 成本的基础概念", "不需要完整 Prometheus 集群"], ["日志", "logging / structlog", "结构化日志、trace_id、错误栈、日志等级", "不输出 API Key 和用户隐私"], ["自动化", "pytest + GitHub Actions", "push/PR 自动运行单测、RAG case、Agent/MCP mock 测试", "不追求复杂流水线"]] },
        { title: "4. 服务器与可选前端", note: "服务能稳定跑、别人能看懂，比功能再加一层更重要。", rows: [["部署", "Docker Compose", "容器重启、healthcheck、volume、环境变量、日志", "不学 Kubernetes"], ["反向代理", "Nginx", "域名、HTTPS、转发到 FastAPI、静态 Vue 资源", "不做复杂负载均衡"], ["备份", "pg_dump / cron", "备份 PostgreSQL、验证恢复、保留最小运行手册", "不做跨地域容灾"], ["可选 UI", "Vue 3 + Vite", "文档上传、聊天、来源卡片、审批按钮、SSE 显示", "没有余力时继续用 FastAPI /docs"]] },
      ],
    },
    plan: { title: "大二下：六个阶段完成 v3 工程收口", desc: "v3 的价值来自工程可信度：工具能否被安全调用、失败能否复盘、服务能否部署和他人能否复现。", phases: [["MCP 概念与最小 Server", ["理解 Client、Server、Tool、Resource、Prompt。", "先实现本地 stdio MCP Server。", "工具只做一个无副作用查询能力。"], "能用 MCP Inspector 或客户端调用工具。"], ["MCP 接入 Agent", ["将 MCP Client 接入 v2 Agent。", "观察模型选择工具、生成参数和获取结果。", "工具失败需转换成可读错误而不是崩溃。"], "Agent 能调用一个外部受控能力。"], ["权限与审批", ["定义只读、低风险写入、高风险写入等级。", "对高风险工具加入 interrupt 审批。", "敏感参数不写入模型上下文或日志。"], "模型无法绕过权限边界。"], ["观测与审计", ["给请求分配 trace_id。", "记录模型、检索、工具调用耗时和错误。", "用 LangSmith 与结构化日志定位一次故障。"], "能复盘一条完整用户请求。"], ["测试与 CI", ["为 MCP 工具、审批、RAG 和 Agent 写关键回归测试。", "GitHub Actions 自动运行 pytest。", "为外部工具使用 mock，避免测试触发真实副作用。"], "提交代码后自动得到测试结果。"], ["产品展示与部署", ["部署到服务器，加入 Nginx/HTTPS/健康检查。", "可选补 Vue 界面展示来源和审批状态。", "完成 README、架构图、演示视频与项目复盘。"], "项目可被他人独立启动和演示。"]] },
    build: { title: "把外部工具接入放在受控边界之后", desc: "Agent 不能直接访问外部系统。它先经过权限和审批层，再由 MCP Client 调用工具；每一次调用都记录审计信息并可在 trace 中回放。", core: "Agent Gateway", branches: [["database", "fa-solid fa-clipboard-list", "Audit + PostgreSQL"], ["cache", "fa-solid fa-plug", "MCP Client / Server"], ["llm", "fa-solid fa-chart-line", "LangSmith + OTel"]], doing: ["MCP Server/Client 与受控工具", "权限分级、审批和审计日志", "RAG/Agent/MCP 回归测试与 CI", "服务器部署、监控和运行手册"], later: ["多 Agent 平台、复杂插件市场", "高风险自动化写入和发送操作", "大规模 Kubernetes 或服务网格", "没有业务需求的数据库与框架堆叠"] },
    apiIntro: "v3 保留 v2 Agent 接口，并补充工具审计、审批和健康检查。MCP Server 的传输接口与业务 API 分开，避免对外暴露内部工具。",
    api: [["post", "POST", "/agent/stream", "流式执行 Agent", "SSE：token、state、tool、interrupt"], ["post", "POST", "/agent/resume", "提交审批决定", '{"thread_id":"...","decision":"approve"}'], ["get", "GET", "/audits", "查看工具调用审计", "按 thread_id、tool_name、outcome 过滤"], ["get", "GET", "/metrics/summary", "项目指标摘要", "请求、延迟、失败、成本统计"], ["get", "GET", "/health", "健康检查", "API、数据库、Redis 连接状态"], ["post", "POST", "/mcp/internal", "内部 MCP 传输", "不直接暴露给普通前端"]],
    dataIntro: "v3 延续文档、Chunk、Agent thread 数据，并新增工具审计和请求追踪关联。数据库只保存必要的可审计信息，避免落库敏感凭据。",
    schema: ["existing tables", "- documents / chunks / conversations", "- agent_threads / approval_events", "", "tool_audits", "- id: UUID, primary key", "- trace_id: VARCHAR(100)", "- thread_id: VARCHAR(100)", "- tool_name: VARCHAR(100)", "- input_summary: JSONB", "- outcome: VARCHAR(20)", "- duration_ms: INTEGER", "", "service_events", "- id: UUID, primary key", "- trace_id: VARCHAR(100)", "- event_type: VARCHAR(60)", "- payload: JSONB"],
    tree: ["enterprise-knowledge-assistant/", "|- app/", "|  |- graph/", "|  |- mcp/client.py", "|  |- mcp/server.py", "|  |- security/permissions.py", "|  |- security/approval.py", "|  |- observability/tracing.py", "|  |- api/agent.py", "|  `- api/audits.py", "|- tests/rag/", "|- tests/agent/", "|- tests/mcp/", "|- .github/workflows/test.yml", "`- docker-compose.yml"],
    deploy: { desc: "v3 部署在你的 Linux 服务器：Docker Compose 运行应用、PostgreSQL 和 Redis，Nginx 负责 HTTPS/反向代理。外部模型仍使用云端 API，不需要 GPU。", local: ["用 mock MCP Server 跑通本地工具调用。", "测试 approve / reject 两条路径。", "运行 pytest 与 GitHub Actions 本地等价命令。", "检查日志中是否泄露 API Key 或敏感工具参数。"], server: ["使用非 root 用户和最小权限环境变量。", "配置 Nginx、HTTPS、健康检查和容器自动重启。", "定期备份 PostgreSQL，保留有限期审计日志。", "用固定演示 case 验证 RAG、Agent、MCP 和审批。"], localCmd: ["docker compose up -d --build", "pytest", "python -m app.mcp.server", "uvicorn app.main:app --reload"], serverCmd: ["git pull", "docker compose up -d --build", "docker compose ps", "docker compose logs -f api"] },
    acceptance: { desc: "v3 完成后，你不需要声称自己做了平台级系统；只要能稳定展示 RAG、Agent、MCP、安全边界、测试和部署闭环，就足够成为一个真实的简历项目。", items: [["MCP 可调用", "Agent 可以通过 MCP 调用至少一个外部受控工具。"], ["权限可解释", "能说明每个工具的权限、风险和审批规则。"], ["审计可追溯", "一次请求可关联模型、检索、工具和审批记录。"], ["测试自动化", "CI 运行关键 pytest，外部工具可 mock。"], ["服务可部署", "服务器上 Docker Compose、Nginx、HTTPS 和健康检查可运行。"], ["项目可讲清", "README、架构图、演示和真实故障复盘完整。"]] },
    next: ["v3 后再按真实需求选择进阶方向", "可以选择 <b>多模态、复杂检索、多 Agent 或本地模型</b> 中的一项改进现有项目，但不要重新开始堆一套无关技术栈。"],
  },
};

function readProgress() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } }
let progress = readProgress();
const requestedVersion = new URLSearchParams(window.location.search).get("version");
let currentVersion = requestedVersion || localStorage.getItem(VERSION_KEY) || "v0";
if (!versions[currentVersion]) currentVersion = "v0";

const htmlList = (items) => items.map((item) => `<li>${item}</li>`).join("");
const byId = (id) => document.querySelector(`#${id}`);

function renderFlow(data) {
  const blocks = data.overview.flow.map(([number, title, detail], index) => `<div><span>${number}</span><b>${title}</b><small>${detail}</small></div>${index < data.overview.flow.length - 1 ? '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>' : ""}`);
  byId("flowLane").setAttribute("aria-label", data.overview.flowName);
  byId("flowLane").innerHTML = blocks.join("");
}

function renderArchitecture(data) {
  const branches = data.build.branches.map(([className, icon, title]) => `<div class="flow-node ${className}"><i class="${icon}" aria-hidden="true"></i><span>${title}</span></div>`).join("");
  byId("architectureFlow").innerHTML = `<div class="flow-node client"><i class="fa-solid fa-laptop-code" aria-hidden="true"></i><span>Swagger / 前端</span></div><i class="fa-solid fa-arrow-right flow-arrow" aria-hidden="true"></i><div class="flow-node api"><i class="fa-solid fa-bolt" aria-hidden="true"></i><span>FastAPI</span></div><i class="fa-solid fa-arrow-right flow-arrow" aria-hidden="true"></i><div class="flow-node service"><i class="fa-solid fa-gears" aria-hidden="true"></i><span>${data.build.core}</span></div><div class="flow-branches">${branches}</div>`;
}

function renderWeeks(data) {
  byId("weekGrid").innerHTML = data.plan.phases.map(([title, bullets, output], index) => `<article class="week-card ${tones[index % tones.length]}"><div class="week-card-head"><span>阶段 ${String(index + 1).padStart(2, "0")}</span><label class="check-control" title="标记阶段 ${index + 1} 完成"><input type="checkbox" data-check="${currentVersion}-phase-${index + 1}" /><i class="fa-solid fa-check" aria-hidden="true"></i></label></div><h3>${title}</h3><ul>${htmlList(bullets)}</ul><p class="week-output"><b>完成后：</b>${output}</p></article>`).join("");
}

function renderStack(data) {
  byId("stackDetails").innerHTML = data.stack.groups.map((group) => `<article class="stack-group"><div class="stack-group-head"><h3>${group.title}</h3><p>${group.note}</p></div><div class="stack-table-wrap"><table class="stack-table"><thead><tr><th>技术</th><th>包 / 服务 / 命令</th><th>在项目中学到什么</th><th>当前不学什么</th></tr></thead><tbody>${group.rows.map(([name, packageName, learn, later]) => `<tr><td>${name}</td><td>${packageName}</td><td>${learn}</td><td>${later}</td></tr>`).join("")}</tbody></table></div></article>`).join("");
}

function renderApi(data) {
  byId("apiRows").innerHTML = data.api.map(([methodClass, method, path, purpose, payload]) => `<tr><td><span class="method ${methodClass}">${method}</span></td><td><code>${path}</code></td><td>${purpose}</td><td><code>${payload}</code></td></tr>`).join("");
}

function renderAcceptance(data) {
  byId("acceptanceGrid").innerHTML = data.acceptance.items.map(([title, text], index) => `<label class="acceptance-item"><input type="checkbox" data-check="${currentVersion}-done-${index + 1}" /><span><i class="fa-solid fa-check" aria-hidden="true"></i></span><b>${title}</b><small>${text}</small></label>`).join("");
}

function bindChecks() {
  document.querySelectorAll("[data-check]").forEach((checkbox) => {
    checkbox.checked = Boolean(progress[checkbox.dataset.check]);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) progress[checkbox.dataset.check] = true;
      else delete progress[checkbox.dataset.check];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      updateProgress();
    });
  });
}

function updateProgress() {
  const checks = Array.from(document.querySelectorAll("[data-check]"));
  const done = checks.filter((item) => progress[item.dataset.check]).length;
  byId("progressCount").textContent = `${currentVersion.toUpperCase()} ${done} / ${checks.length}`;
  byId("progressBar").style.width = `${checks.length ? (done / checks.length) * 100 : 0}%`;
}

function renderVersion(version) {
  const data = versions[version];
  currentVersion = version;
  localStorage.setItem(VERSION_KEY, version);
  document.title = `${data.label} | Enterprise Knowledge Assistant`;
  byId("heroKicker").textContent = `PROJECT BUILD GUIDE / ${data.label.toUpperCase()}`;
  byId("heroTitle").innerHTML = data.hero;
  byId("heroSummary").textContent = data.summary;
  byId("heroFactLabel").textContent = data.fact[0];
  byId("heroFactValue").textContent = data.fact[1];
  byId("statusTitle").textContent = data.status;
  byId("scopeList").innerHTML = data.scope.map((item) => `<li><i class="fa-solid fa-check" aria-hidden="true"></i>${item}</li>`).join("");
  byId("overviewTitle").textContent = data.overview.title;
  byId("overviewDescription").textContent = data.overview.desc;
  byId("userCapabilityTitle").textContent = data.overview.userTitle;
  byId("userCapabilityList").innerHTML = htmlList(data.overview.user);
  byId("boundaryTitle").textContent = data.overview.boundaryTitle;
  byId("boundaryList").innerHTML = htmlList(data.overview.boundary);
  renderFlow(data);
  byId("techStack").innerHTML = data.tech.map(([name, description]) => `<div><dt>${name}</dt><dd>${description}</dd></div>`).join("");
  byId("javaMap").innerHTML = data.java.map(([javaName, pythonName]) => `<div><b>${javaName}</b><span>${pythonName}</span></div>`).join("");
  byId("stackTitle").textContent = data.stack.title;
  byId("stackDescription").textContent = data.stack.desc;
  renderStack(data);
  byId("planTitle").textContent = data.plan.title;
  byId("planDescription").textContent = data.plan.desc;
  renderWeeks(data);
  byId("buildTitle").textContent = data.build.title;
  byId("buildDescription").textContent = data.build.desc;
  renderArchitecture(data);
  byId("buildBoundaryList").innerHTML = htmlList(data.build.doing);
  byId("laterBoundaryList").innerHTML = htmlList(data.build.later);
  byId("apiDescription").textContent = data.apiIntro;
  renderApi(data);
  byId("dataDescription").textContent = data.dataIntro;
  byId("schemaCode").textContent = data.schema.join("\n");
  byId("treeCode").textContent = data.tree.join("\n");
  byId("deployTitle").textContent = `${data.label}：本地与服务器运行`;
  byId("deployDescription").textContent = data.deploy.desc;
  byId("localSteps").innerHTML = htmlList(data.deploy.local);
  byId("serverSteps").innerHTML = htmlList(data.deploy.server);
  byId("localCommand").textContent = data.deploy.localCmd.join("\n");
  byId("serverCommand").textContent = data.deploy.serverCmd.join("\n");
  byId("acceptanceTitle").textContent = `${data.label}：完成标准`;
  byId("acceptanceDescription").textContent = data.acceptance.desc;
  renderAcceptance(data);
  byId("nextTitle").textContent = data.next[0];
  byId("nextDescription").innerHTML = data.next[1];
  byId("footerProjectName").textContent = `${data.label} · Enterprise Knowledge Assistant`;
  document.querySelectorAll(".release-card").forEach((card) => card.classList.remove("selected-release"));
  document.querySelectorAll(".version-link").forEach((link) => {
    const active = link.dataset.version === version;
    link.setAttribute("aria-current", active ? "true" : "false");
    if (active) link.closest(".release-card").classList.add("selected-release");
  });
  bindChecks();
  updateProgress();
  if (window.location.hash) {
    window.setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView(), 0);
  }
}

byId("resetProgress").addEventListener("click", () => {
  if (!window.confirm("确定重置所有版本的项目手册勾选进度吗？")) return;
  progress = {};
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  renderVersion(currentVersion);
});

document.querySelectorAll(".version-link").forEach((link) => link.addEventListener("click", () => renderVersion(link.dataset.version)));
document.querySelectorAll("[data-copy]").forEach((button) => button.addEventListener("click", async () => {
  const source = byId(button.dataset.copy);
  if (!source) return;
  try {
    await navigator.clipboard.writeText(source.textContent.trim());
    const icon = button.querySelector("i");
    icon.className = "fa-solid fa-check";
    window.setTimeout(() => { icon.className = "fa-regular fa-copy"; }, 1200);
  } catch {
    window.prompt("复制以下内容：", source.textContent.trim());
  }
}));

renderVersion(currentVersion);
