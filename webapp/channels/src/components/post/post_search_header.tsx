// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { memo } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import type { Post } from '@workspace/types/posts';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import { Locations } from 'utils/constants';

type Props = {
    post: Post;
    location: keyof typeof Locations;
    isFlagged: boolean;
    isFlaggedPosts?: boolean;
    isPinnedPosts?: boolean;
    channelDisplayName?: React.ReactNode;
    teamDisplayName?: string;
    channelIsArchived?: boolean;
};

const PostSearchHeader = ({
    post,
    location,
    isFlagged,
    isFlaggedPosts,
    isPinnedPosts,
    channelDisplayName,
    teamDisplayName,
    channelIsArchived,
}: Props) => {
    const isRHS = location === Locations.RHS_ROOT || location === Locations.RHS_COMMENT || location === Locations.SEARCH;
    const isSearchResultItem = location === Locations.SEARCH; // Simplified for this component

    if (!(isSearchResultItem || (location !== Locations.CENTER && isFlagged))) {
        return null;
    }

    return (
        <div
            className='search-channel__name__container'
            aria-hidden='true'
        >
            {(Boolean(isSearchResultItem) || isFlaggedPosts) &&
                <span className='search-channel__name'>
                    {channelDisplayName}
                </span>
            }
            {channelIsArchived &&
                <span className='search-channel__archived'>
                    <ArchiveIcon className='icon icon__archive channel-header-archived-icon svg-text-color' />
                    <FormattedMessage
                        id='search_item.channelArchived'
                        defaultMessage='Archived'
                    />
                </span>
            }
            {(Boolean(isSearchResultItem) || isFlaggedPosts) && Boolean(teamDisplayName) &&
                <span className='search-team__name'>
                    {teamDisplayName}
                </span>
            }
        </div>
    );
};

export default memo(PostSearchHeader);
