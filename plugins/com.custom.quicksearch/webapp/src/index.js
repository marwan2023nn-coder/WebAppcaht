import QuickSearchModal from './components/quick_search_modal';

class Plugin {
    initialize(registry, store) {
        // Pass store to the component via props
        const RootComponent = (props) => (
            <QuickSearchModal
                {...props}
                store={store}
            />
        );
        registry.registerRootComponent(RootComponent);
    }
}

window.registerPlugin('com.custom.quicksearch', new Plugin());
