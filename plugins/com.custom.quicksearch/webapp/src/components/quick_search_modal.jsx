import React from 'react';

export default class QuickSearchModal extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            term: '',
            results: [],
        };
        this.inputRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const nextVisible = !this.state.visible;
            this.setState({visible: nextVisible, term: '', results: []});
        } else if (e.key === 'Escape' && this.state.visible) {
            this.setState({visible: false});
        }
    };

    handleSearch = async (e) => {
        const term = e.target.value;
        this.setState({term});

        if (term.length > 0) {
            // Debouncing would be better, but implementing a simple one here
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            this.searchTimeout = setTimeout(async () => {
                try {
                    const state = this.props.store.getState();
                    const teamId = state.entities.teams.currentTeamId;

                    // Retrieve CSRF token from cookies
                    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('MMCSRF='))?.split('=')[1] || '';

                    const response = await fetch('/api/v4/channels/search', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-Token': csrfToken,
                        },
                        body: JSON.stringify({term, team_id: teamId}),
                    });
                    const results = await response.json();
                    this.setState({results: Array.isArray(results) ? results : []});
                } catch (error) {
                    console.error('Search failed', error);
                }
            }, 200);
        } else {
            this.setState({results: []});
        }
    };

    handleSelect = (channel) => {
        const state = this.props.store.getState();
        const currentTeamId = state.entities.teams.currentTeamId;
        const team = state.entities.teams.teams[currentTeamId];
        const teamName = team ? team.name : window.location.pathname.split('/')[1];

        this.setState({visible: false});

        // Navigation using Mattermost internal logic if possible, or fallback
        const url = `/${teamName}/channels/${channel.name}`;
        window.location.href = url;
    };

    render() {
        if (!this.state.visible) {
            return null;
        }

        // Use theme variables if available in state
        const state = this.props.store.getState();
        const theme = state.entities.preferences.myPreferences['theme--default']?.value ?
                      JSON.parse(state.entities.preferences.myPreferences['theme--default'].value) :
                      { centerChannelBg: '#ffffff', centerChannelColor: '#3d3c40' };

        const modalStyle = {
            ...styles.modal,
            backgroundColor: theme.centerChannelBg || '#ffffff',
            color: theme.centerChannelColor || '#333333',
        };

        return (
            <div style={styles.overlay} onClick={() => this.setState({visible: false})}>
                <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.header}>
                        <input
                            autoFocus
                            style={{...styles.input, color: theme.centerChannelColor}}
                            placeholder="Search channels..."
                            value={this.state.term}
                            onChange={this.handleSearch}
                        />
                    </div>
                    <div style={styles.results}>
                        {this.state.results.map((channel) => (
                            <div
                                key={channel.id}
                                style={styles.resultItem}
                                onClick={() => this.handleSelect(channel)}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <span style={styles.channelIcon}>#</span>
                                <span style={styles.channelName}>{channel.display_name || channel.name}</span>
                            </div>
                        ))}
                        {this.state.term && this.state.results.length === 0 && (
                            <div style={styles.noResults}>No channels found</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const styles = {
    overlay: {
        position: 'fixed',
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
