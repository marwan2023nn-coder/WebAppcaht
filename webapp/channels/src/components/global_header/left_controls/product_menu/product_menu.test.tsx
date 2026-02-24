// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import * as reactRedux from 'react-redux';

import mockStore from 'tests/test_store';
import {TopLevelProducts} from 'utils/constants';
import * as productUtils from 'utils/products';
import {TestHelper} from 'utils/test_helper';

import {getLicense} from 'workspace-redux/selectors/entities/general';

import ProductBranding from './product_branding';
import ProductBrandingFreeEdition from './product_branding_team_edition';
import ProductMenu, {ProductMenuButton, ProductMenuContainer} from './product_menu';
import ProductMenuItem from './product_menu_item';
import ProductMenuList from './product_menu_list';

import {isSwitcherOpen} from 'selectors/views/product_menu';

const spyProduct = jest.spyOn(productUtils, 'useCurrentProductId');
spyProduct.mockReturnValue(null);

describe('components/global/product_switcher', () => {
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
    const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');

    const defaultAudioState = {
        audioUrl: '',
        isPlaying: false,
        currentTime: 0,
        mimeType: '',
        isBackground: false,
    };

    const mockUseSelector = (switcherOpen: boolean, license: any) => {
        useSelectorMock.mockImplementation((selector: any) => {
            if (selector === isSwitcherOpen) {
                return switcherOpen;
            }

            if (selector === getLicense) {
                return license;
            }

            // Fallback for selectors like (state) => state.audio
            return defaultAudioState;
        });
    };

    beforeEach(() => {
        const products = [
            TestHelper.makeProduct(TopLevelProducts.BOARDS),
            TestHelper.makeProduct(TopLevelProducts.PLAYBOOKS),
        ];
        const spyProducts = jest.spyOn(productUtils, 'useProducts');
        spyProducts.mockReturnValue(products);
        useDispatchMock.mockClear();
        useSelectorMock.mockClear();
    });

    it('should match snapshot', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: false,
                },
            },
        };
        mockUseSelector(true, {IsLicensed: 'true'});
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot without license', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: false,
                },
            },
        };
        mockUseSelector(true, {IsLicensed: 'false'});
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });

        expect(wrapper).toMatchSnapshot();
    });

    it('should render once when there are no top level products available', () => {
        const state = {
            users: {
                currentUserId: 'test_id',
            },
            views: {
                productMenu: {
                    switcherOpen: true,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        mockUseSelector(true, {IsLicensed: 'true'});
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });

        const spyProducts = jest.spyOn(productUtils, 'useProducts');

        spyProducts.mockReturnValue([]);
        expect(wrapper.find(ProductMenuItem).at(0)).toHaveLength(1);
        expect(wrapper).toMatchSnapshot();
    });

    it('should render the correct amount of times when there are products available', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: true,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        mockUseSelector(true, {IsLicensed: 'true'});
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });
        const products = [
            TestHelper.makeProduct(TopLevelProducts.BOARDS),
            TestHelper.makeProduct(TopLevelProducts.PLAYBOOKS),
        ];

        const spyProducts = jest.spyOn(productUtils, 'useProducts');
        spyProducts.mockReturnValue(products);

        expect(wrapper.find(ProductMenuItem)).toHaveLength(3);
        expect(wrapper).toMatchSnapshot();
    });

    it('should have an active button state when the switcher menu is open', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: true,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        mockUseSelector(true, {IsLicensed: 'true'});
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });
        const setState = jest.fn();

        const useStateSpy = jest.spyOn(React, 'useState');
        useStateSpy.mockImplementation(() => [false, setState]);

        wrapper.find(ProductMenuButton).simulate('click');
        expect(wrapper.find(ProductMenuButton).props()['aria-expanded']).toEqual(true);
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with product switcher menu', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: true,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        mockUseSelector(true, {IsLicensed: 'true'});
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });

        expect(wrapper.find(ProductMenuList)).toHaveLength(1);
        expect(wrapper).toMatchSnapshot();
    });

    it('should render ProductBrandingFreeEdition for Entry license', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: false,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        mockUseSelector(true, {IsLicensed: 'true', SkuShortName: 'entry'});
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });

        expect(wrapper.find(ProductBrandingFreeEdition)).toHaveLength(1);
        expect(wrapper.find(ProductBranding)).toHaveLength(0);
    });

    it('should render ProductBrandingFreeEdition for unlicensed', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: false,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        mockUseSelector(true, {IsLicensed: 'false'});
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });

        expect(wrapper.find(ProductBrandingFreeEdition)).toHaveLength(1);
        expect(wrapper.find(ProductBranding)).toHaveLength(0);
    });

    it('should render ProductBranding for Professional license', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: false,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        mockUseSelector(true, {IsLicensed: 'true', SkuShortName: 'professional'});
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });

        expect(wrapper.find(ProductBranding)).toHaveLength(1);
        expect(wrapper.find(ProductBrandingFreeEdition)).toHaveLength(0);
    });

    it('should render ProductBranding for Enterprise license', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: false,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        mockUseSelector(true, {IsLicensed: 'true', SkuShortName: 'enterprise'});
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });

        expect(wrapper.find(ProductBranding)).toHaveLength(1);
        expect(wrapper.find(ProductBrandingFreeEdition)).toHaveLength(0);
    });

    it('should match snapshot for Entry license', () => {
        const state = {
            views: {
                productMenu: {
                    switcherOpen: false,
                },
            },
        };
        const store = mockStore(state);
        const dummyDispatch = jest.fn();
        useDispatchMock.mockReturnValue(dummyDispatch);
        mockUseSelector(true, {IsLicensed: 'true', SkuShortName: 'entry'});
        const wrapper = shallow(<ProductMenu/>, {
            wrappingComponent: reactRedux.Provider,
            wrappingComponentProps: {store},
        });

        expect(wrapper).toMatchSnapshot();
    });
});
