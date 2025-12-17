// File picker service using Expo APIs
import { Platform, Alert } from 'react-native';

// Dynamic imports to handle cases where packages might not be installed
let ImagePicker: typeof import('expo-image-picker') | null = null;
let DocumentPicker: typeof import('expo-document-picker') | null = null;

// Try to load packages
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ImagePicker = require('expo-image-picker');
} catch (e) {
    console.log('[FilePicker] expo-image-picker not available');
}

try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    DocumentPicker = require('expo-document-picker');
} catch (e) {
    console.log('[FilePicker] expo-document-picker not available');
}

export type PickedFile = {
    name: string;
    type: 'image' | 'video' | 'document' | 'other';
    sizeBytes: number;
    uri: string;
    mimeType?: string;
};

export const filePickerService = {
    async pickImage(): Promise<PickedFile | null> {
        if (!ImagePicker) {
            Alert.alert('Not available', 'expo-image-picker is not installed. Please install it to use this feature.');
            return null;
        }
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant permission to access your photos.');
                return null;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            if (result.canceled || !result.assets[0]) {
                return null;
            }

            const asset = result.assets[0];
            return {
                name: asset.fileName || `image_${Date.now()}.jpg`,
                type: 'image',
                sizeBytes: asset.fileSize || 0,
                uri: asset.uri,
                mimeType: 'image/jpeg',
            };
        } catch (error) {
            console.error('[FilePicker] Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
            return null;
        }
    },

    async takePhoto(): Promise<PickedFile | null> {
        if (!ImagePicker) {
            Alert.alert('Not available', 'expo-image-picker is not installed. Please install it to use this feature.');
            return null;
        }
        try {
            // Request camera permissions
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant permission to access your camera.');
                return null;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 0.8,
            });

            if (result.canceled || !result.assets[0]) {
                return null;
            }

            const asset = result.assets[0];
            return {
                name: asset.fileName || `photo_${Date.now()}.jpg`,
                type: 'image',
                sizeBytes: asset.fileSize || 0,
                uri: asset.uri,
                mimeType: 'image/jpeg',
            };
        } catch (error) {
            console.error('[FilePicker] Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
            return null;
        }
    },

    async pickVideo(): Promise<PickedFile | null> {
        if (!ImagePicker) {
            Alert.alert('Not available', 'expo-image-picker is not installed. Please install it to use this feature.');
            return null;
        }
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant permission to access your videos.');
                return null;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: false,
                quality: 0.8,
            });

            if (result.canceled || !result.assets[0]) {
                return null;
            }

            const asset = result.assets[0];
            return {
                name: asset.fileName || `video_${Date.now()}.mp4`,
                type: 'video',
                sizeBytes: asset.fileSize || 0,
                uri: asset.uri,
                mimeType: 'video/mp4',
            };
        } catch (error) {
            console.error('[FilePicker] Error picking video:', error);
            Alert.alert('Error', 'Failed to pick video. Please try again.');
            return null;
        }
    },

    async pickDocument(): Promise<PickedFile | null> {
        if (!DocumentPicker) {
            Alert.alert('Not available', 'expo-document-picker is not installed. Please install it to use this feature.');
            return null;
        }
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets[0]) {
                return null;
            }

            const asset = result.assets[0];
            const mimeType = asset.mimeType || 'application/octet-stream';
            
            // Determine type from mime type
            let type: 'document' | 'image' | 'video' | 'other' = 'document';
            if (mimeType.startsWith('image/')) {
                type = 'image';
            } else if (mimeType.startsWith('video/')) {
                type = 'video';
            } else if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) {
                type = 'document';
            } else {
                type = 'other';
            }

            return {
                name: asset.name,
                type,
                sizeBytes: asset.size || 0,
                uri: asset.uri,
                mimeType,
            };
        } catch (error) {
            console.error('[FilePicker] Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document. Please try again.');
            return null;
        }
    },
};

