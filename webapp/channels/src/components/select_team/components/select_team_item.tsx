// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';

import type {Team} from '@workspace/types/teams';

import TeamInfoIcon from 'components/widgets/icons/team_info_icon';
import WithTooltip from 'components/with_tooltip';

import * as Utils from 'utils/utils';

interface Props {
    team: Team;
    onTeamClick: (team: Team) => void;
    loading: boolean;
    canJoinPublicTeams: boolean;
    canJoinPrivateTeams: boolean;
}

const SelectTeamItem = ({
    team,
    onTeamClick,
    loading,
    canJoinPublicTeams,
    canJoinPrivateTeams,
}: Props) => {
    const intl = useIntl();

    const handleTeamClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        onTeamClick(team);
    }, [onTeamClick, team]);

    const renderDescriptionTooltip = (): React.ReactNode => {
        if (!team.description) {
            return null;
        }

        return (
            <WithTooltip
                title={team.description}
            >
                <TeamInfoIcon className='icon icon--info'/>
            </WithTooltip>
        );
    };

    let icon;
    if (loading) {
        icon = (
            <span
                className='fa fa-refresh fa-spin right signup-team__icon'
                title={intl.formatMessage({id: 'generic_icons.loading', defaultMessage: 'Loading Icon'})}
            />
        );
    } else {
        icon = (
           <div className='teamicon'>
                    <svg
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M8.25 9V5.25C8.25 4.00736 9.25736 3 10.5 3L16.5 3C17.7426 3 18.75 4.00736 18.75 5.25L18.75 18.75C18.75 19.9926 17.7426 21 16.5 21H10.5C9.25736 21 8.25 19.9926 8.25 18.75V15M12 9L15 12M15 12L12 15M15 12L2.25 12'
                            stroke='white'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                    {'الانضمام الى الفريق'}

                </div>
        );
    }

    const canJoin = (team.allow_open_invite && canJoinPublicTeams) || (!team.allow_open_invite && canJoinPrivateTeams);

    return (
        <div className='signup-team-dir'>
            {renderDescriptionTooltip()}
            <a
                href='#'
                id={Utils.createSafeId(team.display_name)}
                onClick={canJoin ? handleTeamClick : undefined}
                className={canJoin ? '' : 'disabled'}
            >
                <span className='signup-team-dir__name'>{team.display_name}</span>
                {!team.allow_open_invite &&
                    <i
                        className='fa fa-lock light'
                        title={intl.formatMessage({id: 'select_team.private.icon', defaultMessage: 'Private team'})}
                    />}
                {canJoin && icon}
            </a>
        </div>
    );
};

export default React.memo(SelectTeamItem);
