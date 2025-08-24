import { Provider } from 'react-redux';
import store from './index';

export const ReduxProvider = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
