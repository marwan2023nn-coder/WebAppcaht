// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessage} from 'react-intl';

import {LicenseSkus} from 'utils/constants';

import GroupsSVG from './images/groups_svg';

import FeatureDiscovery from '../index';

const GitLabFeatureDiscovery: React.FC = () => {
    return (
        <FeatureDiscovery
            featureName='gitlab'
            minimumSKURequiredForFeature={LicenseSkus.Professional}
            title={defineMessage({
                id: 'admin.gitlab_feature_discovery.title',
                defaultMessage: 'Integrate GitLab SSO with OpenID Connect in Workspace Professional',
            })}
            copy={defineMessage({
                id: 'admin.gitlab_feature_discovery.copy',
                defaultMessage: 'When you connect GitLab as your single sign-on provider, your team can access Workspace without having to re-enter their GitLab credentials. Available only on Workspace Professional and above.',
            })}
            learnMoreURL='https://docs.workspace.com/administration-guide/onboard/sso-gitlab.html'
            featureDiscoveryImage={
                <GroupsSVG
                    width={276}
                    height={170}
                />
            }
        />
    );
};

export default GitLabFeatureDiscovery;
