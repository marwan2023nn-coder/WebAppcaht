// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import './Loader.scss';
import ReactLoading from 'react-loading';

const Loader = ({isLoading}) => {
    if (isLoading) {
        return (
            <div className='fm-loader'>
                <ReactLoading
                    color='black'
                    type='spokes'
                    height={50}
                    width={50}
                />
            </div>
        );
    }

    // Return null when not loading
    return null;
};

export default Loader;
