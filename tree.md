backend/
│
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── logging.py
│   │   └── exceptions.py
│   │
│   ├── api/
│   │   ├── router.py
│   │   └── dependencies.py
│   │
│   ├── modules/                  # Application features
│   │   ├── users/
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   ├── models.py
│   │   │   └── schemas.py
│   │   │
│   │   └── conversations/
│   │       └── ...
│   │
│   ├── agents/                   # AI agent system
│   │   ├── support_agent/
│   │   │   ├── graph.py          # Agent graph definition
│   │   │   ├── nodes.py          # Agent nodes
│   │   │   ├── state.py          # Agent state
│   │   │   ├── tools.py          # Agent tools
│   │   │   └── prompts.py        # System prompts
│   │   │
│   │   ├── research_agent/
│   │   │   └── ...
│   │   │
│   │   ├── orchestration/
│   │   │   └── supervisor.py     # Multi-agent coordination
│   │   │
│   │   ├── memory/
│   │   │   └── checkpointer.py   # Persistent agent memory
│   │   │
│   │   └── registry.py           # Agent registration
│   │
│   ├── db/
│   │   ├── session.py
│   │   ├── base.py
│   │   └── migrations/
│   │
│   ├── integrations/             # External APIs and services
│   ├── middleware/
│   └── utils/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── agents/
│
├── scripts/
├── docs/
│
├── .env
├── .env.example
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
└── README.md