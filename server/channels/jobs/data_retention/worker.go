// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package data_retention

import (
	"time"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/mattermost/mattermost/server/public/shared/request"
	"github.com/mattermost/mattermost/server/v8/channels/jobs"
	"github.com/mattermost/mattermost/server/v8/channels/store"
)

type AppIface interface {
	Config() *model.Config
	RemoveFileFromFileStore(rctx request.CTX, path string)
}

func MakeWorker(jobServer *jobs.JobServer, store store.Store, app AppIface) *jobs.SimpleWorker {
	const workerName = "DataRetention"

	isEnabled := func(cfg *model.Config) bool {
		return model.SafeDereference(cfg.DataRetentionSettings.EnableMessageDeletion) || model.SafeDereference(cfg.DataRetentionSettings.EnableFileDeletion)
	}

	execute := func(logger mlog.LoggerIFace, job *model.Job) error {
		rctx := request.EmptyContext(logger)
		cfg := app.Config()
		batchSize := int64(model.SafeDereference(cfg.DataRetentionSettings.BatchSize))
		timeBetweenBatches := time.Duration(model.SafeDereference(cfg.DataRetentionSettings.TimeBetweenBatchesMilliseconds)) * time.Millisecond

		now := model.GetMillis()
		totalDeletedPosts := int64(0)
		totalDeletedFiles := int64(0)

		logger.Info("Data retention job started")

		// --- 1. Message Retention ---
		if model.SafeDereference(cfg.DataRetentionSettings.EnableMessageDeletion) {
			logger.Info("Starting message retention")
			messageRetentionCutoff := now - int64(model.SafeDereference(cfg.DataRetentionSettings.MessageRetentionDays))*24*60*60*1000
			if model.SafeDereference(cfg.DataRetentionSettings.MessageRetentionHours) > 0 {
				messageRetentionCutoff = now - int64(model.SafeDereference(cfg.DataRetentionSettings.MessageRetentionHours))*60*60*1000
			}

			retentionPolicyBatchConfigs := model.RetentionPolicyBatchConfigs{
				Now:                 now,
				GlobalPolicyEndTime: messageRetentionCutoff,
				Limit:               batchSize,
				PreservePinnedPosts: model.SafeDereference(cfg.DataRetentionSettings.PreservePinnedPosts),
			}

			// Delete Posts
			cursor := model.RetentionPolicyCursor{}
			for {
				deletedCount, newCursor, err := store.Post().PermanentDeleteBatchForRetentionPolicies(retentionPolicyBatchConfigs, cursor)
				if err != nil {
					return err
				}
				cursor = newCursor
				totalDeletedPosts += deletedCount
				if deletedCount < batchSize {
					break
				}
				time.Sleep(timeBetweenBatches)
			}

			// Delete Thread Memberships
			cursor = model.RetentionPolicyCursor{}
			for {
				deletedCount, newCursor, err := store.Thread().PermanentDeleteBatchForRetentionPolicies(retentionPolicyBatchConfigs, cursor)
				if err != nil {
					return err
				}
				cursor = newCursor
				if deletedCount < batchSize {
					break
				}
				time.Sleep(timeBetweenBatches)
			}
		}

		// --- 2. File Retention ---
		if model.SafeDereference(cfg.DataRetentionSettings.EnableFileDeletion) {
			logger.Info("Starting file retention")
			fileRetentionCutoff := now - int64(model.SafeDereference(cfg.DataRetentionSettings.FileRetentionDays))*24*60*60*1000
			if model.SafeDereference(cfg.DataRetentionSettings.FileRetentionHours) > 0 {
				fileRetentionCutoff = now - int64(model.SafeDereference(cfg.DataRetentionSettings.FileRetentionHours))*60*60*1000
			}

			retentionPolicyBatchConfigs := model.RetentionPolicyBatchConfigs{
				Now:                 now,
				GlobalPolicyEndTime: fileRetentionCutoff,
				Limit:               batchSize,
			}

			cursor := model.RetentionPolicyCursor{}
			for {
				deletedCount, newCursor, err := store.FileInfo().PermanentDeleteBatchForRetentionPolicies(retentionPolicyBatchConfigs, cursor)
				if err != nil {
					return err
				}
				cursor = newCursor
				totalDeletedFiles += deletedCount
				if deletedCount < batchSize {
					break
				}
				time.Sleep(timeBetweenBatches)
			}
		}

		// --- 3. Metadata and Storage Cleanup ---
		logger.Info("Starting metadata and storage cleanup")

		idsBatchSize := model.SafeDereference(cfg.DataRetentionSettings.RetentionIdsBatchSize)

		// Cleanup loop for various deletion side effects
		cleanupTables := []string{"Posts", "FileInfoPaths"}
		for _, tableName := range cleanupTables {
			for {
				idsRows, err := store.RetentionPolicy().GetIdsForDeletionByTableName(tableName, idsBatchSize)
				if err != nil {
					return err
				}
				if len(idsRows) == 0 {
					break
				}

				for _, row := range idsRows {
					if tableName == "Posts" {
						// Clean up reactions for deleted posts
						if _, err = store.Reaction().DeleteOrphanedRowsByIds(row); err != nil {
							logger.Warn("Failed to delete orphaned reactions", mlog.Err(err))
						}

						// Clean up FileInfo for deleted posts
						for _, postID := range row.Ids {
							fileInfos, err := store.FileInfo().GetForPost(postID, true, true, false)
							if err != nil {
								logger.Warn("Failed to fetch files for deleted post", mlog.String("post_id", postID), mlog.Err(err))
								continue
							}
							for _, fi := range fileInfos {
								app.RemoveFileFromFileStore(rctx, fi.Path)
								if fi.ThumbnailPath != "" {
									app.RemoveFileFromFileStore(rctx, fi.ThumbnailPath)
								}
								if fi.PreviewPath != "" {
									app.RemoveFileFromFileStore(rctx, fi.PreviewPath)
								}
							}
							if err = store.FileInfo().PermanentDeleteForPost(rctx, postID); err != nil {
								logger.Warn("Failed to delete FileInfo from DB", mlog.String("post_id", postID), mlog.Err(err))
							}
						}
					} else if tableName == "FileInfoPaths" {
						// Clean up files for directly deleted FileInfo (using paths stored in RetentionIdsForDeletion)
						for _, path := range row.Ids {
							app.RemoveFileFromFileStore(rctx, path)
						}
					}
				}
				time.Sleep(timeBetweenBatches)
			}
		}

		// Clean up Channel Member History
		historyConfigs := model.RetentionPolicyBatchConfigs{
			Now:                 now,
			GlobalPolicyEndTime: now - int64(model.SafeDereference(cfg.DataRetentionSettings.MessageRetentionDays))*24*60*60*1000,
			Limit:               batchSize,
		}
		cursor := model.RetentionPolicyCursor{}
		for {
			deletedCount, newCursor, err := store.ChannelMemberHistory().PermanentDeleteBatchForRetentionPolicies(historyConfigs, cursor)
			if err != nil {
				return err
			}
			cursor = newCursor
			if deletedCount < batchSize {
				break
			}
			time.Sleep(timeBetweenBatches)
		}

		if job.Data == nil {
			job.Data = make(model.StringMap)
		}
		job.Data["posts_deleted"] = model.Int64ToString(totalDeletedPosts)
		job.Data["files_deleted"] = model.Int64ToString(totalDeletedFiles)

		logger.Info("Data retention job completed",
			mlog.Int64("posts_deleted", totalDeletedPosts),
			mlog.Int64("files_deleted", totalDeletedFiles))

		return nil
	}

	return jobs.NewSimpleWorker(workerName, jobServer, execute, isEnabled)
}
