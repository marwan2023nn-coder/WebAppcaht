// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/PerformanceLongTaskTiming
 */
export interface PerformanceLongTaskTiming extends PerformanceEntry {
    readonly entryType: 'longtask';
}
