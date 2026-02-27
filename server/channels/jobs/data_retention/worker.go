// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package data_retention

import (
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/mattermost/mattermost/server/public/shared/request"
	"github.com/mattermost/mattermost/server/v8/channels/jobs"
)

type AppIface interface {
	GetGlobalRetentionPolicy() (*model.GlobalRetentionPolicy, *model.AppError)
}

func MakeWorker(jobServer *jobs.JobServer, app AppIface) *jobs.SimpleWorker {
	const workerName = "DataRetention"

	isEnabled := func(cfg *model.Config) bool {
		return *cfg.DataRetentionSettings.EnableMessageDeletion || *cfg.DataRetentionSettings.EnableFileDeletion
	}

	execute := func(logger mlog.LoggerIFace, job *model.Job) error {
		logger.Debug("Data retention worker executing")

		cancelChan := make(chan struct{})
		rctx := request.EmptyContext(logger)
		go jobServer.CancellationWatcher(rctx, job.Id, cancelChan)

		isCanceled := func() bool {
			select {
			case <-cancelChan:
				return true
			default:
				return false
			}
		}

		policy, appErr := app.GetGlobalRetentionPolicy()
		if appErr != nil {
			return appErr
		}

		batchConfigs := model.RetentionPolicyBatchConfigs{
			PreservePinnedPosts: true, // Typically preferred in enterprise
		}

		// Delete posts
		if policy.MessageDeletionEnabled {
			cursor := model.RetentionPolicyCursor{}
			for {
				if isCanceled() {
					return nil
				}
				count, nextCursor, err := jobServer.Store.Post().PermanentDeleteBatchForRetentionPolicies(batchConfigs, cursor)
				if err != nil {
					return err
				}
				logger.Info("Deleted batch of posts", mlog.Int("count", int(count)))
				if nextCursor.ChannelPoliciesDone && nextCursor.TeamPoliciesDone && nextCursor.GlobalPoliciesDone {
					break
				}
				cursor = nextCursor
			}
		}

		// Delete threads
		{
			cursor := model.RetentionPolicyCursor{}
			for {
				if isCanceled() {
					return nil
				}
				count, nextCursor, err := jobServer.Store.Thread().PermanentDeleteBatchForRetentionPolicies(batchConfigs, cursor)
				if err != nil {
					return err
				}
				logger.Info("Deleted batch of threads", mlog.Int("count", int(count)))
				if nextCursor.ChannelPoliciesDone && nextCursor.TeamPoliciesDone && nextCursor.GlobalPoliciesDone {
					break
				}
				cursor = nextCursor
			}
		}

		// Delete thread memberships
		{
			cursor := model.RetentionPolicyCursor{}
			for {
				if isCanceled() {
					return nil
				}
				count, nextCursor, err := jobServer.Store.Thread().PermanentDeleteBatchThreadMembershipsForRetentionPolicies(batchConfigs, cursor)
				if err != nil {
					return err
				}
				logger.Info("Deleted batch of thread memberships", mlog.Int("count", int(count)))
				if nextCursor.ChannelPoliciesDone && nextCursor.TeamPoliciesDone && nextCursor.GlobalPoliciesDone {
					break
				}
				cursor = nextCursor
			}
		}

		// Delete reactions
		{
			cursor := model.RetentionPolicyCursor{}
			for {
				if isCanceled() {
					return nil
				}
				count, nextCursor, err := jobServer.Store.Reaction().PermanentDeleteBatchForRetentionPolicies(batchConfigs, cursor)
				if err != nil {
					return err
				}
				logger.Info("Deleted batch of reactions", mlog.Int("count", int(count)))
				if nextCursor.ChannelPoliciesDone && nextCursor.TeamPoliciesDone && nextCursor.GlobalPoliciesDone {
					break
				}
				cursor = nextCursor
			}
		}

		// Delete files
		if policy.FileDeletionEnabled {
			cursor := model.RetentionPolicyCursor{}
			for {
				if isCanceled() {
					return nil
				}
				count, nextCursor, err := jobServer.Store.FileInfo().PermanentDeleteBatchForRetentionPolicies(batchConfigs, cursor)
				if err != nil {
					return err
				}
				logger.Info("Deleted batch of files", mlog.Int("count", int(count)))
				if nextCursor.ChannelPoliciesDone && nextCursor.TeamPoliciesDone && nextCursor.GlobalPoliciesDone {
					break
				}
				cursor = nextCursor
			}
		}
		// Note: The store interface showed multiple PermanentDeleteBatchForRetentionPolicies signatures.
		// One is likely for posts, another for threads, etc.

		return nil
	}

	return jobs.NewSimpleWorker(workerName, jobServer, execute, isEnabled)
}
