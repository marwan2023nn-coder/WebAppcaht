// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {getCurrentTeam} from 'workspace-redux/selectors/entities/teams';
import {getTheme} from 'workspace-redux/selectors/entities/preferences';

import store from 'stores/redux_store';

import type {GlobalState} from 'types/store';

const styles = {
    overlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '100px',
    },
    modal: {
        width: '600px',
        maxWidth: '90%',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '16px',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
    },
    input: {
        width: '100%',
        fontSize: '18px',
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
    },
    results: {
        maxHeight: '400px',
        overflowY: 'auto',
    },
    resultItem: {
        padding: '12px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.2s',
    },
    channelIcon: {
        marginRight: '12px',
        fontSize: '20px',
        color: '#999',
        width: '20px',
        textAlign: 'center',
    },
    channelName: {
        fontSize: '16px',
    },
    noResults: {
        padding: '20px',
        textAlign: 'center',
        color: '#999',
    },
};

const QuickSearchModal: React.FC = () => {
    const [visible, setVisible] = React.useState(false);
    const [term, setTerm] = React.useState('');
    const [results, setResults] = React.useState<any[]>([]);

    const currentTeam = useSelector(getCurrentTeam);
    const theme = useSelector(getTheme);
    const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setVisible((v) => !v);
                setTerm('');
                setResults([]);
            } else if (e.key === 'Escape' && visible) {
                setVisible(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [visible]);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTerm(val);

        if (val.length > 0) {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
            searchTimeout.current = setTimeout(async () => {
                try {
                    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('MMCSRF='))?.split('=')[1] || '';

                    const response = await fetch('/api/v4/channels/search', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-Token': csrfToken,
                        },
                        body: JSON.stringify({term: val, team_id: currentTeam?.id}),
                    });
                    const data = await response.json();
                    setResults(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error('Search failed', error);
                }
            }, 200);
        } else {
            setResults([]);
        }
    };

    const handleSelect = (channel: any) => {
        setVisible(false);
        const teamName = currentTeam?.name || window.location.pathname.split('/')[1];
        window.location.href = `/${teamName}/channels/${channel.name}`;
    };

    if (!visible) {
        return null;
    }

    const modalStyle = {
        ...styles.modal,
        backgroundColor: theme.centerChannelBg || '#ffffff',
        color: theme.centerChannelColor || '#333333',
    };

    return (
        <div style={styles.overlay} onClick={() => setVisible(false)}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <input
                        autoFocus
                        style={{...styles.input, color: theme.centerChannelColor}}
                        placeholder="Search channels..."
                        value={term}
                        onChange={handleSearch}
                    />
                </div>
                <div style={styles.results}>
                    {results.map((channel) => (
                        <div
                            key={channel.id}
                            style={styles.resultItem}
                            onClick={() => handleSelect(channel)}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <span style={styles.channelIcon}>#</span>
                            <span style={styles.channelName}>{channel.display_name || channel.name}</span>
                        </div>
                    ))}
                    {term && results.length === 0 && (
                        <div style={styles.noResults}>No channels found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickSearchModal;
