src/
├── core/ # Core framework components
│ ├── base/ # Base classes
│ │ ├── BaseAPI.ts
│ │ ├── BaseTest.ts
│ │ └── BasePage.ts # If needed for hybrid tests
│ ├── config/ # Configuration management
│ │ ├── ConfigManager.ts
│ │ └── environments/
│ ├── http/ # HTTP client layer
│ │ ├── HttpClient.ts
│ │ ├── RequestBuilder.ts
│ │ └── ResponseValidator.ts
│ └── utils/ # Core utilities
│ ├── Logger.ts
│ ├── Reporter.ts
│ └── ErrorHandler.ts
├── api/ # API layer
│ ├── clients/ # API service clients
│ │ ├── ApiClient.ts
│ │ ├── AuthClient.ts
│ │ └── ResourceClient.ts
│ ├── models/ # Request/Response models
│ │ ├── requests/
│ │ └── responses/
│ └── contracts/ # API contracts/interfaces
├── tests/ # Test suites
│ ├── specs/ # Test specifications
│ ├── data/ # Test data
│ │ ├── factories/
│ │ └── fixtures/
│ └── suites/ # Test suites organization
├── support/ # Test support
│ ├── hooks/
│ ├── fixtures/
│ └── helpers/
└── reports/ # Test reports
