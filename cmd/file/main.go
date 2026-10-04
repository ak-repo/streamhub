package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"time"

	"github.com/ak-repo/stream-hub/gen/filespb"
	filegrpc "github.com/ak-repo/stream-hub/internal/file/adapter/grpc"
	repository "github.com/ak-repo/stream-hub/internal/file/adapter/postgres"
	redisstore "github.com/ak-repo/stream-hub/internal/file/adapter/redis"
	"github.com/ak-repo/stream-hub/internal/file/adapter/storage"
	"github.com/ak-repo/stream-hub/internal/file/app"
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

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config load failed: %v", err)
	}

	helper.OverrideLocal(cfg)

	logger.Init(cfg.Logging.Level, cfg.Logging.Format)
	defer logger.Sync()

	//db
	pgDB, err := platformdb.NewPostgresDB(context.Background(), cfg)
	if err != nil {
		log.Fatal("failed to connect db:", zap.Error(err))
	}
	defer pgDB.Close()

	// MinIO storage
	s3, err := storage.NewS3Storage(cfg, 15*time.Minute)
	if err != nil {
		log.Fatal("failed to connect MinIo storage:", zap.Error(err))
	}

	// ---- Create gRPC Client Container ----
	clientContainer := clients.NewClients(cfg)
	defer clientContainer.CloseAll()

	// Redis
	rAddr := fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port)
	redisclient.Init(rAddr)
	tempStore := redisstore.NewTempStore(redisclient.Client, 15*time.Minute)

	// repo - service - server
	repo := repository.NewFileRepository(pgDB.Pool)
	service := app.NewFileService(repo, tempStore, s3, 15*time.Minute, *clientContainer)
	server := filegrpc.NewServer(service)

	addr := fmt.Sprintf(":%s", cfg.Services.File.Port)
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatal("listen failed", zap.Error(err))
	}
	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(interceptors.AppErrorInterceptor(), interceptors.UnaryLoggingInterceptor()))

	filespb.RegisterFileServiceServer(grpcServer, server)
	filespb.RegisterAdminFileServiceServer(grpcServer, server)

	logger.Log.Info("channel-service listening",
		zap.String("addr", addr),
	)

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal("grpc file server failed ", zap.Error(err))
	}
}
