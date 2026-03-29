// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type ViewType = 'kanban';

export type View = {
    id: string;
    channel_id: string;
    type: ViewType;
    creator_id: string;
    title: string;
    description?: string;
    sort_order: number;
    props?: Record<string, any>;
    create_at: number;
    update_at: number;
    delete_at: number;
};

export type ViewPatch = {
    title?: string;
    description?: string;
    sort_order?: number;
    props?: Record<string, any>;
};

export type ViewsWithCount = {
    views: View[];
    total_count: number;
};

export type ViewQueryOpts = {
    page?: number;
    per_page?: number;
};

export type ViewsState = {
    views: Record<string, View>;
    viewsByChannel: Record<string, string[]>;
};
