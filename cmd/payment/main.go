package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"time"

	"github.com/ak-repo/stream-hub/gen/paymentpb"
	paymentgrpc "github.com/ak-repo/stream-hub/internal/payment/adapter/grpc"
	"github.com/ak-repo/stream-hub/internal/payment/adapter/pay"
	"github.com/ak-repo/stream-hub/internal/payment/adapter/postgres"
	paymentredis "github.com/ak-repo/stream-hub/internal/payment/adapter/redis"
	"github.com/ak-repo/stream-hub/internal/platform/config"

	"github.com/ak-repo/stream-hub/internal/payment/app"
	"github.com/ak-repo/stream-hub/internal/platform/grpc/clients"
	"github.com/ak-repo/stream-hub/internal/platform/grpc/interceptors"
	"github.com/ak-repo/stream-hub/internal/platform/helper"
	"github.com/ak-repo/stream-hub/internal/platform/logger"
	platformdb "github.com/ak-repo/stream-hub/internal/platform/postgres"
	redisclient "github.com/ak-repo/stream-hub/internal/platform/redis"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

const (
	GRPC_PORT = ":50051"
	// Replace with your actual connection string
	DATABASE_URL = "postgres://user:password@localhost:5432/paymentdb?sslmode=disable"
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

	// ---- Create gRPC Client Container ----
	clientContainer := clients.NewClients(cfg)
	defer clientContainer.CloseAll()

	repo := postgres.NewPaymentRepo(pgDB.Pool)
	pay := pay.NewRazorpayGateway(cfg)
	// Redis
	rAddr := fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port)
	redisclient.Init(rAddr)

	redis := paymentredis.NewPaymentRedis(redisclient.Client, time.Minute*15)

	service := app.NewPaymentService(repo, pay, redis, clientContainer)

	server := paymentgrpc.NewGrpcServer(service)

	addr := fmt.Sprintf(":%s", cfg.Services.Payment.Port)
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatal("listen failed", zap.Error(err))
	}
	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(interceptors.AppErrorInterceptor(), interceptors.UnaryLoggingInterceptor()))

	paymentpb.RegisterPaymentServiceServer(grpcServer, server)

	logger.Log.Info("payment-service listening",
		zap.String("addr", addr),
	)

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal("grpc file server failed ", zap.Error(err))
	}
}
