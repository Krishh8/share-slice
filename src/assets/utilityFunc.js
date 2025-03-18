import { Timestamp } from "@react-native-firebase/firestore"

export const convertToTimestamp = (isoString) => {
    return isoString ? Timestamp.fromDate(new Date(isoString)) : null;
}

export const convertToIsoString = (timestamp) => {
    return timestamp instanceof Timestamp ? timestamp.toDate().toISOString() : null;
};
