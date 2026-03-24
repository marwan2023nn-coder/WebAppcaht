// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package wsapi

import (
	"github.com/mattermost/mattermost/server/public/model"
)

func (api *API) InitPost() {
	api.Router.Handle("mark_delivered", api.APIWebSocketHandler(api.markDelivered))
	api.Router.Handle("mark_read", api.APIWebSocketHandler(api.markRead))
}

func (api *API) markDelivered(req *model.WebSocketRequest) (map[string]any, *model.AppError) {
	postId, ok := req.Data["post_id"].(string)
	if !ok || !model.IsValidId(postId) {
		return nil, NewInvalidWebSocketParamError(req.Action, "post_id")
	}

	post, err := api.App.GetSinglePost(nil, postId, false)
	if err != nil {
		return nil, err
	}

	// Only update if not already delivered or read
	if post.DeliveredAt > 0 || post.ReadAt > 0 {
		return nil, nil
	}

	deliveredAt := model.GetMillis()
	if err := api.App.Srv().Store().Post().UpdatePostReceipts(postId, deliveredAt, 0); err != nil {
		return nil, model.NewAppError("markDelivered", "api.websocket_handler.mark_delivered.app_error", nil, err.Error(), 500)
	}

	// Broadcast to the post author
	event := model.NewWebSocketEvent(model.WebsocketEventPostDelivered, "", "", post.UserId, nil, "")
	event.Add("post_id", postId)
	event.Add("delivered_at", deliveredAt)
	api.App.Publish(event)

	return nil, nil
}

func (api *API) markRead(req *model.WebSocketRequest) (map[string]any, *model.AppError) {
	postId, ok := req.Data["post_id"].(string)
	if !ok || !model.IsValidId(postId) {
		return nil, NewInvalidWebSocketParamError(req.Action, "post_id")
	}

	post, err := api.App.GetSinglePost(nil, postId, false)
	if err != nil {
		return nil, err
	}

	// Only update if not already read
	if post.ReadAt > 0 {
		return nil, nil
	}

	readAt := model.GetMillis()
	// When marking as read, also ensure DeliveredAt is set if it wasn't
	deliveredAt := post.DeliveredAt
	if deliveredAt == 0 {
		deliveredAt = readAt
	}

	if err := api.App.Srv().Store().Post().UpdatePostReceipts(postId, deliveredAt, readAt); err != nil {
		return nil, model.NewAppError("markRead", "api.websocket_handler.mark_read.app_error", nil, err.Error(), 500)
	}

	// Broadcast to the post author
	event := model.NewWebSocketEvent(model.WebsocketEventPostRead, "", "", post.UserId, nil, "")
	event.Add("post_id", postId)
	event.Add("delivered_at", deliveredAt)
	event.Add("read_at", readAt)
	api.App.Publish(event)

	return nil, nil
}
