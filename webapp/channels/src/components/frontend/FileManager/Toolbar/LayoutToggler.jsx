// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {BsGridFill} from 'react-icons/bs';
import {FaCheck, FaListUl} from 'react-icons/fa6';

import {useLayout} from '../../contexts/LayoutContext';
import {useDetectOutsideClick} from '../../hooks/useDetectOutsideClick';

// eslint-disable-next-line react/prop-types
const LayoutToggler = ({setShowToggleViewMenu, onLayoutChange}) => {
    const toggleViewRef = useDetectOutsideClick(() => {
        setShowToggleViewMenu(false);
    });
    const {activeLayout, setActiveLayout} = useLayout();

    const layoutOptions = [
        {
            key: 'grid',
            name: 'شبكة',
            // eslint-disable-next-line react/react-in-jsx-scope
            icon: <BsGridFill size={15}/>,
        },
        {
            key: 'list',
            name: 'قائمة',
            // eslint-disable-next-line react/react-in-jsx-scope
            icon: <FaListUl size={15}/>,
        },
    ];

    const handleSelection = (key) => {
        setActiveLayout(key);
        onLayoutChange(key);
        setShowToggleViewMenu(false);
    };

    return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <div
            ref={toggleViewRef.ref}
            className='toggle-view'
            role='dropdown'
        >
            <ul
                role='menu'
                aria-orientation='vertical'
            >
                {layoutOptions.map((option) => (
                    <li
                        role='menuitem'
                        key={option.key}
                        onClick={() => handleSelection(option.key)}
                        onKeyDown={() => handleSelection(option.key)}
                    >
                        <span>{option.key === activeLayout && <FaCheck size={13}/>}</span>
                        <span>{option.name}</span>
                        <span>{option.icon}</span>

                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LayoutToggler;
