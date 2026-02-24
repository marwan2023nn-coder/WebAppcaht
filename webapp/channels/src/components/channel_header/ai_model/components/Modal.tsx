// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import './filezip.scss';
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const BootstrapModal: React.FC<ModalProps> = ({isOpen, onClose, children}) => {
    return (
        <Modal
            show={isOpen}
            onHide={onClose}
            className='filezip '
        >
            <Modal.Header closeButton={true}>
                <Modal.Title
                    componentClass='h1'
                    id='aboutModalLabel'
                    style={{textAlign: 'right'}}
                >
                    {'مساحة عمل سوفا '}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>

                {children}

            </Modal.Body>
        </Modal>
    );
};

export default BootstrapModal;
