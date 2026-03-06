// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {UserReport} from '@workspace/types/reports';

import {ColumnNames, StatusFilter} from '../constants';

import {getSortColumnForOptions, getSortDirectionForOptions, getSortableColumnValueBySortColumn, getStatusFilterOption} from './index';

describe('getSortColumnForOptions', () => {
    it('should return correct sort column for email', () => {
        const result = getSortColumnForOptions(ColumnNames.email);
        expect(result.sort_column).toBe('Email');
    });

    it('should return correct sort column for createAt', () => {
        const result = getSortColumnForOptions(ColumnNames.createAt);
        expect(result.sort_column).toBe('CreateAt');
    });

    it('should return correct sort column for lastLoginAt', () => {
        const result = getSortColumnForOptions(ColumnNames.lastLoginAt);
        expect(result.sort_column).toBe('LastLogin');
    });

    it('should return correct sort column for lastStatusAt', () => {
        const result = getSortColumnForOptions(ColumnNames.lastStatusAt);
        expect(result.sort_column).toBe('LastStatusAt');
    });

    it('should return correct sort column for lastPostDate', () => {
        const result = getSortColumnForOptions(ColumnNames.lastPostDate);
        expect(result.sort_column).toBe('LastPostDate');
    });

    it('should return correct sort column for daysActive', () => {
        const result = getSortColumnForOptions(ColumnNames.daysActive);
        expect(result.sort_column).toBe('DaysActive');
    });

    it('should return correct sort column for totalPosts', () => {
        const result = getSortColumnForOptions(ColumnNames.totalPosts);
        expect(result.sort_column).toBe('TotalPosts');
    });

    it('should default to username if no id is provided', () => {
        const result = getSortColumnForOptions();
        expect(result.sort_column).toBe('Username');
    });
});

describe('getSortDirectionForOptions', () => {
    it('should return ascending sort direction if desc is false', () => {
        const result = getSortDirectionForOptions(false);
        expect(result.sort_direction).toBe('asc');
    });

    it('should return descending sort direction if desc is true', () => {
        const result = getSortDirectionForOptions(true);
        expect(result.sort_direction).toBe('desc');
    });
});

describe('getSortableColumnValueBySortColumn', () => {
    it('should return email value when sortColumn is email', () => {
        const row = {email: 'test@example.com', id: 'testId'} as UserReport;
        const result = getSortableColumnValueBySortColumn(row, ColumnNames.email);
        expect(result).toBe('test@example.com');
    });

    it('should return create_at value as string when sortColumn is createAt', () => {
        const row = {create_at: 1234} as UserReport;
        const result = getSortableColumnValueBySortColumn(row, ColumnNames.createAt);
        expect(typeof result).toBe('string');
        expect(result).toBe('1234');
    });

    it('should return last_login_at value as string when sortColumn is lastLoginAt', () => {
        const row = {last_login_at: 1234} as UserReport;
        const result = getSortableColumnValueBySortColumn(row, ColumnNames.lastLoginAt);
        expect(result).toBe('1234');
    });

    it('should return last_status_at value as string when sortColumn is lastStatusAt', () => {
        const row = {last_status_at: 1234} as UserReport;
        const result = getSortableColumnValueBySortColumn(row, ColumnNames.lastStatusAt);
        expect(result).toBe('1234');
    });

    it('should return last_post_date value as string when sortColumn is lastPostDate', () => {
        const row = {last_post_date: 1234} as UserReport;
        const result = getSortableColumnValueBySortColumn(row, ColumnNames.lastPostDate);
        expect(result).toBe('1234');
    });

    it('should return days_active value as string when sortColumn is daysActive', () => {
        const row = {days_active: 5} as UserReport;
        const result = getSortableColumnValueBySortColumn(row, ColumnNames.daysActive);
        expect(result).toBe('5');
    });

    it('should return total_posts value as string when sortColumn is totalPosts', () => {
        const row = {total_posts: 10} as UserReport;
        const result = getSortableColumnValueBySortColumn(row, ColumnNames.totalPosts);
        expect(result).toBe('10');
    });

    it('should return username value by default', () => {
        const row = {username: 'testuser', id: 'testId', create_at: 22122} as UserReport;
        const result = getSortableColumnValueBySortColumn(row, 'someOtherColumn');
        expect(result).toBe('testuser');
    });
});

describe('getStatusFilterOption', () => {
    it('should return hide_inactive true for Active status', () => {
        const result = getStatusFilterOption(StatusFilter.Active);
        expect(result).toEqual({hide_inactive: true});
    });

    it('should return hide_active true for Deactivated status', () => {
        const result = getStatusFilterOption(StatusFilter.Deactivated);
        expect(result).toEqual({hide_active: true});
    });

    it('should return an empty object for other status', () => {
        const result = getStatusFilterOption('SomeOtherStatus' as any);
        expect(result).toEqual({});
    });
});
