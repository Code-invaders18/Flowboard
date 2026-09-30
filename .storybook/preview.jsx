import { Provider } from 'react-redux';
import '../src/index.css';
import { createStore } from '../src/store/store';
import { createSeedState } from '../src/data/seedData';

// Every story gets a fresh seeded store so connected components render with real data.
export const decorators = [
  (Story, context) => (
    <Provider store={createStore(createSeedState())}>
      <div className="bg-surface-muted p-4 font-sans text-text">
        <Story {...context} />
      </div>
    </Provider>
  ),
];

export const parameters = {
  layout: 'fullscreen',
  controls: { expanded: true },
};
