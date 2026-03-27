// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

const MockComponent = ({children}) => <div>{children}</div>;

export const Modal = Object.assign(MockComponent, {
    Header: MockComponent,
    Title: MockComponent,
    Body: MockComponent,
    Footer: MockComponent,
});

export const OverlayTrigger = MockComponent;
export const Tooltip = MockComponent;
export const Popover = MockComponent;
export const Dropdown = Object.assign(MockComponent, {
    Toggle: MockComponent,
    Menu: MockComponent,
});
export const MenuItem = MockComponent;
export const Nav = MockComponent;
export const NavItem = MockComponent;
export const Navbar = Object.assign(MockComponent, {
    Header: MockComponent,
    Brand: MockComponent,
    Toggle: MockComponent,
    Collapse: MockComponent,
});
export const NavDropdown = MockComponent;
export const FormGroup = MockComponent;
export const ControlLabel = MockComponent;
export const FormControl = Object.assign(MockComponent, {
    Feedback: MockComponent,
    Static: MockComponent,
});
export const HelpBlock = MockComponent;
export const InputGroup = Object.assign(MockComponent, {
    Addon: MockComponent,
    Button: MockComponent,
});
export const Button = MockComponent;
export const ButtonGroup = MockComponent;
export const ButtonToolbar = MockComponent;
export const Checkbox = MockComponent;
export const Radio = MockComponent;
export const ToggleButton = MockComponent;
export const ToggleButtonGroup = MockComponent;
export const Alert = MockComponent;
export const Badge = MockComponent;
export const Label = MockComponent;
export const ProgressBar = MockComponent;
export const Well = MockComponent;
export const Glyphicon = MockComponent;
export const Table = MockComponent;
export const Grid = MockComponent;
export const Row = MockComponent;
export const Col = MockComponent;
export const Clearfix = MockComponent;
export const Collapse = MockComponent;
export const Fade = MockComponent;
export const Tab = MockComponent;
export const Tabs = MockComponent;
export const TabContainer = MockComponent;
export const TabContent = MockComponent;
export const TabPane = MockComponent;
export const ListGroup = MockComponent;
export const ListGroupItem = MockComponent;
export const Panel = Object.assign(MockComponent, {
    Heading: MockComponent,
    Title: MockComponent,
    Body: MockComponent,
    Footer: MockComponent,
    Collapse: MockComponent,
    Toggle: MockComponent,
});
export const PanelGroup = MockComponent;
export const Media = Object.assign(MockComponent, {
    Left: MockComponent,
    Right: MockComponent,
    Body: MockComponent,
    Heading: MockComponent,
    List: MockComponent,
    ListItem: MockComponent,
});
export const Carousel = Object.assign(MockComponent, {
    Item: MockComponent,
    Caption: MockComponent,
});
export const Jumbotron = MockComponent;
export const PageHeader = MockComponent;
export const PageItem = MockComponent;
export const Pager = Object.assign(MockComponent, {
    Item: MockComponent,
});
export const Pagination = Object.assign(MockComponent, {
    Item: MockComponent,
});
export const Breadcrumb = Object.assign(MockComponent, {
    Item: MockComponent,
});
export const Image = MockComponent;
export const ResponsiveEmbed = MockComponent;
export const SafeAnchor = MockComponent;
export const SplitButton = MockComponent;
export const DropdownButton = MockComponent;
