// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package sqlstore

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/request"
	"github.com/mattermost/mattermost/server/v8/channels/store"
	"github.com/mattermost/mattermost/server/v8/einterfaces"
	sq "github.com/mattermost/squirrel"
	"github.com/pkg/errors"
)

type SqlAttributesStore struct {
	*SqlStore
	metrics einterfaces.MetricsInterface

	selectQueryBuilder sq.SelectBuilder
}

func attributesSliceColumns(prefix ...string) []string {
	var p string
	if len(prefix) == 1 {
		// Security: table aliases are whitelisted to prevent SQL injection through unvalidated schema references.
		switch prefix[0] {
		default:
			panic("invalid table alias: " + prefix[0])
		}
	} else if len(prefix) > 1 {
		panic("cannot accept multiple prefixes")
	}

	return []string{
		p + "TargetID as ID",
		p + "TargetType as Type",
		p + "Attributes",
	}
}

func newSqlAttributesStore(sqlStore *SqlStore, metrics einterfaces.MetricsInterface) store.AttributesStore {
	s := &SqlAttributesStore{
		SqlStore: sqlStore,
		metrics:  metrics,
	}

	s.selectQueryBuilder = s.getQueryBuilder().Select(attributesSliceColumns()...).From("AttributeView")

	return s
}

func (s *SqlAttributesStore) RefreshAttributes() error {
	if _, err := s.GetMaster().Exec("REFRESH MATERIALIZED VIEW AttributeView"); err != nil {
		return errors.Wrap(err, "error refreshing materialized view AttributeView")
	}

	return nil
}

func (s *SqlAttributesStore) GetSubject(rctx request.CTX, ID, groupID string) (*model.Subject, error) {
	query := s.selectQueryBuilder.Where(sq.And{sq.Eq{"TargetID": ID}, sq.Eq{"GroupID": groupID}})

	q, args, err := query.ToSql()
	if err != nil {
		return nil, errors.Wrap(err, "failed to build query for subject")
	}

	row := s.GetReplica().QueryRowxContext(rctx.Context(), q, args...)
	if err := row.Err(); err != nil {
		return nil, errors.Wrap(err, "failed to get subject")
	}

	var subject model.Subject
	var properties []byte

	if err := row.Scan(&subject.ID, &subject.Type, &properties); err != nil {
		if err == sql.ErrNoRows {
			return nil, store.NewErrNotFound("Attributes", ID)
		}
		return nil, errors.Wrap(err, "failed to scan subject row")
	}

	if err := json.Unmarshal(properties, &subject.Attributes); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal attributes")
	}

	return &subject, nil
}

func (s *SqlAttributesStore) SearchUsers(rctx request.CTX, opts model.SubjectSearchOptions) ([]*model.User, int64, error) {
	query := s.getQueryBuilder().
		Select(getUsersColumns()...).From("Users").LeftJoin("AttributeView ON Users.Id = AttributeView.TargetID").
		OrderBy("Users.Id ASC")

	count := s.getQueryBuilder().Select("COUNT(*)").From("Users").LeftJoin("AttributeView ON Users.Id = AttributeView.TargetID")

	if opts.Query != "" {
		query = query.Where(sq.Expr(opts.Query, opts.Args...))
		count = count.Where(sq.Expr(opts.Query, opts.Args...))
	}

	if opts.Limit > 0 {
		query = query.Limit(uint64(opts.Limit))
	} else if opts.Limit > MaxPerPage {
		query = query.Limit(uint64(MaxPerPage))
	}

	if !opts.AllowInactive {
		query = query.Where("Users.DeleteAt = 0")
		count = count.Where("Users.DeleteAt = 0")
	}

	if opts.TeamID != "" {
		query = query.Where("Users.Id IN (SELECT UserId FROM TeamMembers WHERE TeamId = ? AND DeleteAt = 0)", opts.TeamID)
		count = count.Where("Users.Id IN (SELECT UserId FROM TeamMembers WHERE TeamId = ? AND DeleteAt = 0)", opts.TeamID)
	}

	if opts.ExcludeChannelMembers != "" {
		query = query.Where("NOT EXISTS (SELECT 1 FROM ChannelMembers WHERE ChannelMembers.UserId = Users.Id AND ChannelMembers.ChannelId = ?)", opts.ExcludeChannelMembers)
	}

	if opts.SubjectID != "" {
		query = query.Where("Users.Id = ?", opts.SubjectID)
		count = count.Where("Users.Id = ?", opts.SubjectID)
	}

	if opts.Cursor.TargetID != "" {
		query = query.Where("TargetID > ?", opts.Cursor.TargetID)
	}

	searchFields := make([]string, 0, len(UserSearchTypeNames))
	for _, field := range UserSearchTypeNames {
		searchFields = append(searchFields, strings.Join([]string{"Users", field}, "."))
	}

	if term := opts.Term; strings.TrimSpace(term) != "" {
		query = generateSearchQueryForExpression(query, strings.Fields(term), searchFields)
		count = generateSearchQueryForExpression(count, strings.Fields(term), searchFields)
	}

	q, args, err := query.ToSql()
	if err != nil {
		return nil, 0, errors.Wrap(err, "failed to build query for subjects")
	}

	users := []*model.User{}
	if err = s.GetReplica().Select(&users, q, args...); err != nil {
		return nil, 0, errors.Wrapf(err, "failed to find Users with term=%s and searchType=%v", opts.Term, searchFields)
	}

	for _, u := range users {
		u.Sanitize(map[string]bool{})
	}

	var total int64

	if !opts.IgnoreCount {
		err = s.GetReplica().GetBuilder(&total, count)
		if err != nil {
			return nil, 0, errors.Wrapf(err, "failed to count Users with term=%s and searchType=%v", opts.Term, searchFields)
		}
	}

	return users, total, nil
}

func (s *SqlAttributesStore) GetChannelMembersToRemove(rctx request.CTX, channelID string, opts model.SubjectSearchOptions) ([]*model.ChannelMember, error) {
	query := s.getQueryBuilder().
		Select(channelMemberSliceColumns()...).From("ChannelMembers").LeftJoin("AttributeView ON ChannelMembers.UserId = AttributeView.TargetID").
		OrderBy("ChannelMembers.UserId ASC")

	if opts.Query != "" {
		query = query.Where("(NOT COALESCE(("+opts.Query+"), FALSE) OR AttributeView.TargetID IS NULL)", opts.Args...)
	}

	query = query.Where("ChannelMembers.ChannelId = ?", channelID)

	if opts.Limit > 0 {
		query = query.Limit(uint64(opts.Limit))
	} else if opts.Limit > MaxPerPage {
		query = query.Limit(uint64(MaxPerPage))
	}

	if opts.Cursor.TargetID != "" {
		query = query.Where("ChannelMembers.UserId > ?", opts.Cursor.TargetID)
	}

	q, args, err := query.ToSql()
	if err != nil {
		return nil, errors.Wrap(err, "failed to build query for subjects")
	}

	members := []*model.ChannelMember{}
	if err := s.GetReplica().Select(&members, q, args...); err != nil {
		return nil, errors.Wrapf(err, "failed to find channel members with for channel id=%s", channelID)
	}

	return members, nil
}

func generateSearchQueryForExpression(query sq.SelectBuilder, terms []string, fields []string) sq.SelectBuilder {
	allowedFields := map[string]bool{
		"Users.Username":  true,
		"Users.FirstName": true,
		"Users.LastName":  true,
		"Users.Nickname":  true,
		"Users.Email":     true,
	}

	for _, term := range terms {
		var searchFields sq.Or
		cleanedTerm := strings.TrimLeft(term, "@")
		likeTerm := "%" + cleanedTerm + "%"

		for _, field := range fields {
			if !allowedFields[field] {
				continue
			}
			searchFields = append(searchFields, sq.Expr(fmt.Sprintf("LOWER(%s) LIKE LOWER(?) ESCAPE '*'", field), likeTerm))
		}
		searchFields = append(searchFields, sq.Expr("LOWER(Users.Id) LIKE LOWER(?) ESCAPE '*'", cleanedTerm))
		query = query.Where(searchFields)
	}

	return query
}
