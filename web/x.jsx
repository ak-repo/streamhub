// // reques handling in channel
// ch.Post("/sendinvite", channel.SendInvite)
// ch.Post("/sendjoin", channel.SendJoin)
// ch.Get("/invites", channel.ListUserInvites)
// ch.Get("/joins/:id", channel.ListChannelJoins)
// ch.Post("/updatereq", channel.UpdateRequestStatus)

// func (h *ChannelHandler) SendInvite(c *fiber.Ctx) error {
// 	var req struct {
// 		ChannelID string `json:"channelId"`
// 		UserID    string `json:"userId"`
// 	}
// 	if err := c.BodyParser(&req); err != nil || req.ChannelID == "" || req.UserID == "" {
// 		return response.InvalidReqBody(c)
// 	}
// 	ctx, cancel := helper.WithGRPCTimeout()
// 	defer cancel()

// 	resp, err := h.client.SendInvite(ctx, &channelpb.SendInviteRequest{UserId: req.UserID, ChannelId: req.ChannelID})
// 	if err != nil {
// 		code, body := errors.GRPCToFiber(err)
// 		return response.Error(c, code, body)
// 	}

// 	return response.Success(c, "Invite sented", resp)
// }

// func (h *ChannelHandler) SendJoin(c *fiber.Ctx) error {
// 	var req struct {
// 		ChannelID string `json:"channelId"`
// 		UserID    string `json:"userId"`
// 	}
// 	if err := c.BodyParser(&req); err != nil || req.ChannelID == "" || req.UserID == "" {
// 		return response.InvalidReqBody(c)
// 	}
// 	ctx, cancel := helper.WithGRPCTimeout()
// 	defer cancel()

// 	resp, err := h.client.SendJoin(ctx, &channelpb.SendJoinRequest{UserId: req.UserID, ChannelId: req.ChannelID})
// 	if err != nil {
// 		code, body := errors.GRPCToFiber(err)
// 		return response.Error(c, code, body)
// 	}
// 	return response.Success(c, "Invite sented", resp)
// }

// func (h *ChannelHandler) ListUserInvites(c *fiber.Ctx) error {
// 	uid, ok := c.Locals("userID").(string)
// 	if !ok || uid == "" {
// 		return response.Error(c, fiber.StatusUnauthorized, fiber.Map{"error": "unauthorized"})
// 	}
// 	ctx, cancel := helper.WithGRPCTimeout()
// 	defer cancel()
// 	resp, err := h.client.ListUserInvites(ctx, &channelpb.ListUserInviteRequest{UserId: uid})
// 	if err != nil {
// 		code, body := errors.GRPCToFiber(err)
// 		return response.Error(c, code, body)
// 	}
// 	return response.Success(c, "user invites", resp)
// }

// func (h *ChannelHandler) ListChannelJoins(c *fiber.Ctx) error {
// 	channelID := c.Params("id")
// 	if channelID == "" {
// 		return response.InvalidReqBody(c)
// 	}
// 	ctx, cancel := helper.WithGRPCTimeout()
// 	defer cancel()
// 	resp, err := h.client.ListChannelJoins(ctx, &channelpb.ListChannelJoinRequest{ChannelId: channelID})
// 	if err != nil {
// 		code, body := errors.GRPCToFiber(err)
// 		return response.Error(c, code, body)
// 	}
// 	return response.Success(c, "channel join request", resp)
// }

// func (h *ChannelHandler) UpdateRequestStatus(c *fiber.Ctx) error {
// 	var req struct {
// 		ReqID  string `json:"reqId"`
// 		Status string `json:"status"`
// 	}
// 	if err := c.BodyParser(&req); err != nil || req.Status == "" || req.ReqID == "" {
// 		return response.InvalidReqBody(c)
// 	}
// 	ctx, cancel := helper.WithGRPCTimeout()
// 	defer cancel()
// 	resp, err := h.client.UpdateRequestStatus(ctx, &channelpb.StatusUpdateRequest{Id: req.ReqID, Status: req.Status})
// 	if err != nil {
// 		code, body := errors.GRPCToFiber(err)
// 		return response.Error(c, code, body)
// 	}
// 	return response.Success(c, "request updated", resp)
// }
