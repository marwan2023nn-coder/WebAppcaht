// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Settings} from 'luxon';
import moment from 'moment-timezone';
import {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentTimezone} from 'workspace-redux/selectors/entities/timezone';

import {getCurrentLocale} from 'selectors/i18n';

export default function LuxonController() {
    const locale = useSelector(getCurrentLocale);

    useEffect(() => {
        Settings.defaultLocale = locale;
        moment.locale(locale);
    }, [locale]);

    const tz = useSelector(getCurrentTimezone);
    useEffect(() => {
        Settings.defaultZone = tz ?? 'system';
    }, [tz]);

    return null;
}
