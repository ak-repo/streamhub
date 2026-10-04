package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"time"

	"github.com/ak-repo/stream-hub/gen/authpb"
	authcloudinary "github.com/ak-repo/stream-hub/internal/auth/adapter/cloudinary"
	authgrpc "github.com/ak-repo/stream-hub/internal/auth/adapter/grpc"
	"github.com/ak-repo/stream-hub/internal/auth/adapter/postgres"
	otpredis "github.com/ak-repo/stream-hub/internal/auth/adapter/redis"
	"github.com/ak-repo/stream-hub/internal/auth/app"
	"github.com/ak-repo/stream-hub/internal/platform/config"

	platformdb "github.com/ak-repo/stream-hub/internal/platform/postgres"

	"github.com/ak-repo/stream-hub/internal/platform/grpc/interceptors"
	"github.com/ak-repo/stream-hub/internal/platform/helper"
	"github.com/ak-repo/stream-hub/internal/platform/jwt"
	"github.com/ak-repo/stream-hub/internal/platform/logger"
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

	// jwt manager
	tokenExpiry := 10 * time.Minute
	jwtMan := jwt.NewJWTManager(cfg.JWT.Secret, tokenExpiry, tokenExpiry)

	// Redis
	rAddr := fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port)
	redisclient.Init(rAddr)
	rClient := redisclient.Client

	otpStore := otpredis.NewOTPStore(rClient, 10*time.Minute)

	cloudCli, err := authcloudinary.NewCloudinaryUploader(cfg.Cloudinary.CloudName, cfg.Cloudinary.APIKey, cfg.Cloudinary.APISecret)
	postgres.UsersSeeder(context.Background(), pgDB.Pool)
	if err != nil {
		log.Fatal("cloudinary staring failed, ", err.Error())
	}

	// repo -> service -> server
	repo := postgres.NewUserRepository(pgDB.Pool)
	service := app.NewAuthService(repo, jwtMan, cfg, otpStore, cloudCli)
	server := authgrpc.NewServer(service)

	addr := fmt.Sprintf(":%s", cfg.Services.Auth.Port)
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatal("listen failed", zap.Error(err))
	}

	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			interceptors.AppErrorInterceptor(),
			interceptors.UnaryLoggingInterceptor(),
		),
	)

	authpb.RegisterAuthServiceServer(grpcServer, server)
	authpb.RegisterAdminAuthServiceServer(grpcServer, server)

	logger.Log.Info("auth-service listening",
		zap.String("addr", addr),
	)

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal("grpc auth server failed", zap.Error(err))
	}

}
