SHELL := /bin/sh

GO ?= go
NPM ?= npm
COMPOSE ?= docker compose

.DEFAULT_GOAL := help

.PHONY: help install docker-up docker-down docker-restart docker-logs docker-ps migrate \
	auth channel file payment gateway services frontend dev test build lint

help: ## Show the available commands
	@awk 'BEGIN {FS = ":.*## "; printf "Usage: make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Download Go modules and install frontend dependencies
	$(GO) mod download
	$(NPM) --prefix web ci

docker-up: ## Start PostgreSQL, Redis, MinIO, and run migrations
	$(COMPOSE) up -d postgres redis minio
	$(COMPOSE) run --rm migrate

docker-down: ## Stop the infrastructure containers
	$(COMPOSE) down

docker-restart: docker-down docker-up ## Restart the infrastructure containers

docker-logs: ## Follow infrastructure container logs
	$(COMPOSE) logs -f

docker-ps: ## Show infrastructure container status
	$(COMPOSE) ps

migrate: ## Run all pending database migrations
	$(COMPOSE) run --rm migrate

auth: ## Run the auth gRPC service
	$(GO) run ./cmd/auth

channel: ## Run the channel gRPC service
	$(GO) run ./cmd/channel

file: ## Run the file gRPC service
	$(GO) run ./cmd/file

payment: ## Run the payment gRPC service
	$(GO) run ./cmd/payment

gateway: ## Run the HTTP API gateway
	$(GO) run ./cmd/gateway

services: ## Run all Go services locally; Ctrl+C stops them
	@set -e; \
	pids=""; \
	trap 'kill $$pids 2>/dev/null || true' INT TERM EXIT; \
	$(GO) run ./cmd/auth & pids="$$pids $$!"; \
	$(GO) run ./cmd/channel & pids="$$pids $$!"; \
	$(GO) run ./cmd/file & pids="$$pids $$!"; \
	$(GO) run ./cmd/payment & pids="$$pids $$!"; \
	$(GO) run ./cmd/gateway & pids="$$pids $$!"; \
	wait

frontend: ## Run the Vite development server
	$(NPM) --prefix web run dev

dev: docker-up ## Start infrastructure, all Go services, and the frontend
	@set -e; \
	pids=""; \
	trap 'kill $$pids 2>/dev/null || true' INT TERM EXIT; \
	$(GO) run ./cmd/auth & pids="$$pids $$!"; \
	$(GO) run ./cmd/channel & pids="$$pids $$!"; \
	$(GO) run ./cmd/file & pids="$$pids $$!"; \
	$(GO) run ./cmd/payment & pids="$$pids $$!"; \
	$(GO) run ./cmd/gateway & pids="$$pids $$!"; \
	$(NPM) --prefix web run dev & pids="$$pids $$!"; \
	wait

test: ## Run backend tests
	$(GO) test ./...

build: ## Build the backend services and frontend
	$(GO) build ./cmd/...
	$(NPM) --prefix web run build

lint: ## Run Go vet and frontend linting
	$(GO) vet ./...
	$(NPM) --prefix web run lint
