package handler

import (
	"github.com/ak-repo/stream-hub/gen/channelpb"
	errors "github.com/ak-repo/stream-hub/internal/platform/apperror"
	"github.com/ak-repo/stream-hub/internal/platform/helper"
	"github.com/ak-repo/stream-hub/internal/platform/response"
	"github.com/gofiber/fiber/v2"
)

// -------------------------------------------------------------------CHANNEL-----------------------------------------------------
// -------------------- Join Channel --------------------
func (h *ChannelHandler) JoinChannel(c *fiber.Ctx) error {
	req := new(channelpb.AddMemberRequest)

	if err := c.BodyParser(req); err != nil {
		return response.InvalidReqBody(c)

	}

	ctx, cancel := helper.WithGRPCTimeout()
	defer cancel()

	resp, err := h.client.AddMember(ctx, req)
	if err != nil {
		code, body := errors.GRPCToFiber(err)
		return response.Error(c, code, body)

	}

	return response.Success(c, "joined", resp)
}

func (h *ChannelHandler) AddMember(c *fiber.Ctx) error {
	req := new(channelpb.AddMemberRequest)

	if err := c.BodyParser(req); err != nil {
		return response.InvalidReqBody(c)

	}

	ctx, cancel := helper.WithGRPCTimeout()
	defer cancel()

	resp, err := h.client.AddMember(ctx, req)
	if err != nil {
		code, body := errors.GRPCToFiber(err)
		return response.Error(c, code, body)

	}

	return response.Success(c, "added", resp)

}
