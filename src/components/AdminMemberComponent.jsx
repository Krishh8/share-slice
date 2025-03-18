import * as React from 'react';
import { View } from 'react-native';
import { Button, Menu, Divider, PaperProvider } from 'react-native-paper';

const AdminMemberComponent = () => {
    const [visible, setVisible] = React.useState(false);

    const openMenu = () => setVisible(true);

    const closeMenu = () => setVisible(false);

    return (
        <PaperProvider>
            <View
                style={{
                    paddingTop: 50,
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={<Button onPress={openMenu}>Show menu</Button>}>
                    <Menu.Item onPress={() => { }} title="Item 1" />
                    <Menu.Item onPress={() => { }} title="Item 2" />
                </Menu>
            </View>
        </PaperProvider>
    );
};

export default AdminMemberComponent;