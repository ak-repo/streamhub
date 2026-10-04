package main

import (
	"context"
	"fmt"
	"log"
	"net"

	"github.com/ak-repo/stream-hub/gen/channelpb"
	channelgrpc "github.com/ak-repo/stream-hub/internal/channel/adapter/grpc"
	"github.com/ak-repo/stream-hub/internal/channel/adapter/postgres"
	chatredis "github.com/ak-repo/stream-hub/internal/channel/adapter/redis"
	"github.com/ak-repo/stream-hub/internal/channel/app"
	"github.com/ak-repo/stream-hub/internal/platform/config"
	"github.com/ak-repo/stream-hub/internal/platform/grpc/clients"
	"github.com/ak-repo/stream-hub/internal/platform/grpc/interceptors"
	"github.com/ak-repo/stream-hub/internal/platform/helper"
	"github.com/ak-repo/stream-hub/internal/platform/logger"
	platformdb "github.com/ak-repo/stream-hub/internal/platform/postgres"
	redisclient "github.com/ak-repo/stream-hub/internal/platform/redis"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

func main() {

	// 1. Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config load failed: %v", err)
	}

	helper.OverrideLocal(cfg)
	logger.Init(cfg.Logging.Level, cfg.Logging.Format)
	defer logger.Sync()

	ctx := context.Background()

	// 2. Initialize PostgreSQL
	pgDB, err := platformdb.NewPostgresDB(ctx, cfg)
	if err != nil {
		log.Fatal("failed to connect to database:", zap.Error(err))
	}
	defer pgDB.Close()

	// ---- Create gRPC Client Container ----
	clientContainer := clients.NewClients(cfg)
	defer clientContainer.CloseAll()

	// Redis
	rAddr := fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port)
	redisclient.Init(rAddr)
	rClient := redisclient.Client

	// 4. Initialize Clean Architecture layers
	repo := postgres.NewChannelRepo(pgDB.Pool)
	ps := chatredis.NewRedisPubSub(rClient)
	svc := app.NewChannelService(repo, ps, clientContainer, cfg)
	grpcHandler := channelgrpc.NewServer(svc)

	// 5. Start gRPC server
	addr := fmt.Sprintf(":%s", cfg.Services.Chat.Port)
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatal("listen failed", zap.Error(err))
	}

	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(interceptors.AppErrorInterceptor(), interceptors.UnaryLoggingInterceptor()))
	channelpb.RegisterChannelServiceServer(grpcServer, grpcHandler)
	channelpb.RegisterAdminChannelServiceServer(grpcServer, grpcHandler)

	logger.Log.Info("channel-service listening",
		zap.String("addr", addr),
	)

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal("grpc channel server failed", zap.Error(err))
	}
}
