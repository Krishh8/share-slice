import dynamicLinks from '@react-native-firebase/dynamic-links'
import { Linking } from 'react-native'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const checkContactsPermission = async () => {
    const status = await check(PERMISSIONS.ANDROID.READ_CONTACTS);
    return status === RESULTS.GRANTED;
};

export const askContactsPermission = async () => {
    const status = await request(PERMISSIONS.ANDROID.READ_CONTACTS);
    return status === RESULTS.GRANTED;
};


export const generateInviteLink = async (groupId) => {
    console.log(`groupId in generate link : ${groupId}`)
    try {
        return await dynamicLinks().buildShortLink({
            link: `https://shareslice.com/groupInvite?groupId=${groupId}`,
            domainUriPrefix: 'https://sharesliceapp.page.link',
            android: {
                packageName: 'com.shareslice',
                fallbackUrl: 'https://play.google.com/store/apps/details?id=com.shareslice',
            },
        })
    } catch (error) {
        console.error('Error creating invite link:', error)
        return null
    }
}

export const sendInviteViaSMS = async (phoneNumber, groupId, setIsLoading) => {
    setIsLoading?.(true)
    console.log(`groupId in : ${phoneNumber, groupId}`)

    try {
        const inviteLink = await generateInviteLink(groupId)
        console.log('link:', inviteLink)
        if (!inviteLink) return

        const message = `Hey! Join my group on ShareSlice using this link: ${inviteLink}`
        const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`
        await Linking.openURL(smsUrl)
    } catch (error) {
        console.error('Error sending SMS invite:', error)
    } finally {
        setIsLoading?.(false)
    }
}