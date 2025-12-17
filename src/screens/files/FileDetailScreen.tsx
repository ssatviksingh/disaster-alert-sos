// src/screens/files/FileDetailScreen.tsx
import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Linking,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import Screen from "../../components/common/Screen";
import AppText from "../../components/common/AppText";
import AppButton from "../../components/common/AppButton";
import { useFilesStore } from "../../store/filesStore";
import { useAppTheme } from "../../theme/useTheme";
import { useNavigation } from "@react-navigation/native";

type Props = NativeStackScreenProps<RootStackParamList, "FileDetail">;

const FileDetailScreen: React.FC<Props> = ({ route }) => {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const { fileId } = route.params;

  const file = useFilesStore((s) => s.getById(fileId));

  if (!file) {
    return (
      <Screen>
        <AppText variant="title">File not found</AppText>
      </Screen>
    );
  }

  const openFile = async () => {
    try {
      await Linking.openURL(file.url);
    } catch {
      Alert.alert("Error", "Unable to open this file.");
    }
  };

  const attachToSos = () => {
    navigation.navigate("Main", {
      screen: "SOS",
      params: {
        attachFileId: file._id,
      },
    });
  };

  return (
    <Screen>
      <AppText variant="title" style={{ marginBottom: 4 }}>
        {file.name}
      </AppText>

      <AppText variant="small" muted>
        {file.type} · {file.sizeLabel}
      </AppText>

      {/* 🔹 REAL PREVIEW */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
        ]}
      >
        <AppText variant="subtitle">Preview</AppText>

        {file.type === "image" ? (
          <Image
            source={{ uri: file.url }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <>
            <AppText variant="small" muted style={{ marginTop: 8 }}>
              This file can be opened using a supported app.
            </AppText>
            <View style={{ marginTop: 12 }}>
              <AppButton title="Open file" onPress={openFile} />
            </View>
          </>
        )}
      </View>

      {/* 🔹 METADATA */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
        ]}
      >
        <AppText variant="subtitle">Metadata</AppText>

        <AppText variant="small" muted style={{ marginTop: 6 }}>
          Saved at: {new Date(file.createdAt).toLocaleString()}
        </AppText>

        {file.tags?.length > 0 && (
          <AppText variant="small" muted style={{ marginTop: 6 }}>
            Tags: {file.tags.join(", ")}
          </AppText>
        )}
      </View>

      {/* 🔹 REAL ATTACH TO SOS */}
      <View style={{ marginTop: 16 }}>
        <AppButton title="Attach to SOS" onPress={attachToSos} />
      </View>

      <View style={{ marginTop: 12 }}>
        <AppButton
          title="Back to files"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 16,
  },
  image: {
    width: "100%",
    height: 220,
    marginTop: 12,
    borderRadius: 12,
  },
});

export default FileDetailScreen;
