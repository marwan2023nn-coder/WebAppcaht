// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import styled from 'styled-components';

import {searchHintOptions, searchFilesHintOptions} from 'utils/constants';

type Props = {
    onSelectFilter: (filter: string) => void;
    searchType: string;
    searchTerms: string;
    searchTeam: string;
    hasSelectedOption: boolean;
    isDate: boolean;
}

const SearchHintsContainer = styled.div`
    display: flex;
    padding: 20px 24px;
    color: rgba(var(--center-channel-color-rgb), 0.75);
    i {
        margin-inline-end: 8px;
        color: var(--center-channel-color-56);
    }
    h2 {
        all: inherit;
        display: inline;
        margin: 0;
        padding: 0;
    }
`;

const SearchFilter = styled.button`
    display: flex;
    padding: 4px 10px;
    color: var(--center-channel-color);
    background: rgba(var(--center-channel-color-rgb), 0.08);
    border-radius: var(--radius-l);
    border: none;
    font-size: 10px;
    font-family: 'Effra_Trial_SBd';
    line-height: 12px;
    margin-inline-start: 8px;
    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.16);
    }
`;

const SearchHints = ({onSelectFilter, searchType, searchTerms, searchTeam, hasSelectedOption, isDate}: Props): JSX.Element => {
    const intl = useIntl();
    let filters = searchHintOptions.filter((filter) => filter.searchTerm !== '-' && filter.searchTerm !== '""');
    if (searchType === 'files') {
        filters = searchFilesHintOptions.filter((filter) => filter.searchTerm !== '-' && filter.searchTerm !== '""');
    }

    // if search team is '' (all teams), remove "from" and "in" filters
    if (!searchTeam) {
        filters = filters.filter((filter) => filter.searchTerm !== 'From:' && filter.searchTerm !== 'In:');
    }

    if (isDate) {
        return <></>;
    }

    if (hasSelectedOption) {
        return (
            <SearchHintsContainer id='searchHints'>
                <i className='icon icon-keyboard-return'/>
                <FormattedMessage
                    id='search_hint.enter_to_select'
                    defaultMessage='Press Enter to select'
                />
            </SearchHintsContainer>
        );
    }

    if (searchTerms.length > 0 && searchTerms[searchTerms.length - 1] !== ' ') {
        return (
            <SearchHintsContainer id='searchHints'>
                <i className='icon icon-keyboard-return'/>
                <FormattedMessage
                    id='search_hint.enter_to_search'
                    defaultMessage='Press Enter to search'
                />
            </SearchHintsContainer>
        );
    }

    return (
        <SearchHintsContainer id='searchHints'>
            <i
                className='icon icon-lightbulb-outline'
                aria-hidden='true'
            />
            <h2>
                <FormattedMessage
                    id='search_hint.filter'
                    defaultMessage='Filter your search with:'
                />
            </h2>
            {filters.map((filter) => {
                const term = (filter.displayMessage ? intl.formatMessage(filter.displayMessage) : filter.searchTerm);
                return (
                    <SearchFilter
                        key={filter.searchTerm}
                        onClick={() => onSelectFilter(term)}
                    >
                        <span title={intl.formatMessage(filter.message)}>
                            {term}
                        </span>
                    </SearchFilter>
                );
            })}
        </SearchHintsContainer>
    );
};

export default SearchHints;
