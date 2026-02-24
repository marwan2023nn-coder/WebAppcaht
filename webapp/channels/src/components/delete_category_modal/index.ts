// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {deleteCategory} from 'workspace-redux/actions/channel_categories';

import DeleteCategoryModal from './delete_category_modal';

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            deleteCategory,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(DeleteCategoryModal);
