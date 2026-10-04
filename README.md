# StreamHub

StreamHub is a collaborative channel platform with real-time chat, channel file sharing, subscriptions, and administrative controls.

## Stack

- Go services using gRPC and a Fiber HTTP gateway
- React and Vite frontend
- PostgreSQL, Redis, and MinIO
- Razorpay payments and Cloudinary avatars

## Repository layout

```text
.
├── api/proto/          # Protobuf service contracts
├── cmd/                # Runnable service entry points
├── gen/                # Generated Go protobuf code
├── internal/
│   ├── auth/           # Authentication and user management
│   ├── channel/        # Channels, members, requests, and chat
│   ├── file/           # File metadata and object storage
│   ├── gateway/        # Fiber HTTP and WebSocket gateway
│   ├── payment/        # Plans, payment sessions, and verification
│   └── platform/       # Private shared infrastructure
├── migrations/         # PostgreSQL migrations
├── web/                # React application
├── config.yaml         # Local development configuration
├── docker-compose.yml  # Local PostgreSQL, Redis, and MinIO
└── Makefile            # Development commands
```

Each domain service uses `domain`, `port`, `app`, and `adapter` packages. Entrypoints in `cmd` only assemble dependencies and start their servers.

## Local development

Install Go and frontend dependencies:

```sh
make install
```

Start infrastructure, apply migrations, and run all backend and frontend processes:

```sh
make dev
```

Useful individual commands:

```sh
make docker-up
make services
make frontend
make auth
make channel
make file
make payment
make gateway
```

Stop the infrastructure containers with `make docker-down`.

## Development checks

```sh
make proto
make test
make lint
make build
```

Generated protobuf files are committed under `gen`. Regenerate them after changing any contract under `api/proto`.
