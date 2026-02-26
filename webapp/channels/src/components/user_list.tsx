// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {FixedSizeList as List} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import type {Channel, ChannelMembership} from '@workspace/types/channels';
import type {TeamMembership} from '@workspace/types/teams';
import type {UserProfile} from '@workspace/types/users';

import LoadingScreen from 'components/loading_screen';

import UserListRow from './user_list_row';

type Props = {
    rowComponentType?: React.ComponentType<any>;
    length?: number;
    actions?: Array<React.ComponentType<any>>;
    actionUserProps?: {
        [userId: string]: {
            channel?: Channel;
            teamMember: TeamMembership;
            channelMember?: ChannelMembership;
        };
    };
    isDisabled?: boolean;
    users?: UserProfile[] | null;
    extraInfo?: {[key: string]: Array<string | JSX.Element>};
    actionProps?: {
        mfaEnabled: boolean;
        enableUserAccessTokens: boolean;
        experimentalEnableAuthenticationTransfer: boolean;
        doPasswordReset: (user: UserProfile) => void;
        doEmailReset: (user: UserProfile) => void;
        doManageTeams: (user: UserProfile) => void;
        doManageRoles: (user: UserProfile) => void;
        doManageTokens: (user: UserProfile) => void;
        isDisabled?: boolean;
    };
}

export default class UserList extends React.PureComponent <Props> {
    static defaultProps = {
        users: [],
        extraInfo: {},
        actions: [],
        actionProps: {},
        rowComponentType: UserListRow,
    };
    containerRef: React.RefObject<any>;

    constructor(props: Props) {
        super(props);
        this.containerRef = React.createRef();
    }

    scrollToTop = () => {
        if (this.containerRef.current) {
            this.containerRef.current.scrollTop = 0;
        }
    };

    render() {
        const users = this.props.users;
        const RowComponentType = this.props.rowComponentType;

        if (users == null) {
            return <LoadingScreen/>;
        }

        if (users.length === 0) {
            return (
                <div
                    key='no-users-found'
                    className='more-modal__placeholder-row no-users-found'
                    data-testid='noUsersFound'
                >
                    <p>
                        <FormattedMessage
                            id='user_list.notFound'
                            defaultMessage='No users found'
                        />
                    </p>
                </div>
            );
        }

        if (!RowComponentType || !this.props.actionProps) {
            return null;
        }

        const {actionUserProps, extraInfo, actions, actionProps, isDisabled} = this.props;

        const Row = ({index, style}: {index: number; style: React.CSSProperties}) => {
            const user = users[index];
            if (!user) {
                return null;
            }
            return (
                <div style={style}>
                    <RowComponentType
                        key={user.id}
                        user={user}
                        extraInfo={extraInfo?.[user.id]}
                        actions={actions}
                        actionProps={actionProps}
                        actionUserProps={actionUserProps?.[user.id]}
                        index={index}
                        totalUsers={users.length}
                        userCount={index}
                        isDisabled={isDisabled}
                    />
                </div>
            );
        };

        return (
            <div
                ref={this.containerRef}
                style={{height: 'calc(100vh - 300px)', minHeight: '400px'}}
            >
                <AutoSizer>
                    {({height, width}) => (
                        <List
                            height={height}
                            itemCount={users.length}
                            itemSize={65}
                            width={width}
                            overscanCount={5}
                        >
                            {Row}
                        </List>
                    )}
                </AutoSizer>
            </div>
        );
    }
}
