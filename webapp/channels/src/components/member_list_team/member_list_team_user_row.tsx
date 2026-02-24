import React from 'react';

import type {ConnectedComponent} from 'react-redux';

import type {Channel, ChannelMembership} from '@workspace/types/channels';
import type {TeamMembership} from '@workspace/types/teams';
import type {UserProfile as UserProfileType} from '@workspace/types/users';

import {Client4} from 'workspace-redux/client';

import ProfilePicture from 'components/profile_picture';

import {createSafeId} from 'utils/utils';

type Props = {
    user: UserProfileType;
    extraInfo?: Array<string | JSX.Element>;
    actions?: Array<ConnectedComponent<any, any>>;
    actionProps?: {
        mfaEnabled: boolean;
        enableUserAccessTokens: boolean;
        experimentalEnableAuthenticationTransfer: boolean;
        doPasswordReset: (user: UserProfileType) => void;
        doEmailReset: (user: UserProfileType) => void;
        doManageTeams: (user: UserProfileType) => void;
        doManageRoles: (user: UserProfileType) => void;
        doManageTokens: (user: UserProfileType) => void;
        isDisabled?: boolean;
    };
    actionUserProps?: {
        channel?: Channel;
        teamMember?: TeamMembership;
        channelMember?: ChannelMembership;
    };
    index?: number;
    totalUsers?: number;
    userCount?: number;
    isDisabled?: boolean;
};

const getPreferredUserLabel = (user: UserProfileType): string => {
    if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
    }

    if (user.first_name) {
        return user.first_name;
    }

    return user.username;
};

const MemberListTeamUserRow = ({
    user,
    actions = [],
    actionProps,
    actionUserProps = {},
    index,
    totalUsers,
    userCount,
    isDisabled,
}: Props) => {
    let buttons = null;
    if (actions) {
        buttons = actions.map((Action, actionIndex) => {
            return (
                <Action
                    key={actionIndex.toString()}
                    user={user}
                    index={index}
                    totalUsers={totalUsers}
                    {...actionProps}
                    {...actionUserProps}
                    isDisabled={isDisabled}
                />
            );
        });
    }

    let userCountID: string | undefined;
    if (userCount !== undefined && userCount >= 0) {
        userCountID = createSafeId('memberListTeamUserRowName' + userCount);
    }

    return (
        <div
            key={user.id}
            className='more-modal__row'
        >
            <ProfilePicture
                src={Client4.getProfilePictureUrl(user.id, user.last_picture_update)}
                status={user.status}
                size='md'
                userId={user.id}
                username={user.username}
            />
            <div className='more-modal__details'>
                <div
                    id={userCountID}
                    className='more-modal__name'
                >
                    {getPreferredUserLabel(user)}
                </div>
            </div>
            <div className='more-modal__actions'>
                {buttons}
            </div>
        </div>
    );
};

export default MemberListTeamUserRow;
