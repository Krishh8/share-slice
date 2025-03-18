import './gesture-handler';
import { AppRegistry, useColorScheme } from 'react-native';
import { name as appName } from './app.json';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { LightScheme } from './src/theme/LightScheme';
import { DarkScheme } from './src/theme/DarkScheme';
import App from './src/App';
import { store } from './src/redux/store';

const LightTheme = {
    ...MD3LightTheme,
    colors: LightScheme
}

const DarkTheme = {
    ...MD3DarkTheme,
    colors: DarkScheme
}

export default function Main() {
    const colorScheme = useColorScheme();

    const theme = colorScheme === 'dark' ? DarkTheme : LightTheme
    return (
        <ReduxProvider store={store}>
            <PaperProvider theme={theme}>
                <App />
            </PaperProvider>
        </ReduxProvider>
    );
}

AppRegistry.registerComponent(appName, () => Main);
