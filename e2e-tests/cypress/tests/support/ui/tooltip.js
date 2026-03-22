// Copyright (c) 2015-present Sofa, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetToolTip', (text) => {
    cy.findByRole('tooltip').should('exist').and('contain', text);
});
