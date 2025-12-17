import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Screen from "../../components/common/Screen";
import AppText from "../../components/common/AppText";
import AppButton from "../../components/common/AppButton";
import { useFilesStore } from "../../store/filesStore";
import { useAppTheme } from "../../theme/useTheme";
import { colors } from "../../theme/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { filePickerService } from "../../services/filePicker";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

const filterLabels: { key: "all" | "document" | "image" | "video" | "other"; label: string }[] =
  [
    { key: "all", label: "All" },
    { key: "document", label: "Docs" },
    { key: "image", label: "Images" },
    { key: "video", label: "Videos" },
    { key: "other", label: "Other" },
  ];

type SortOption = "name" | "date" | "size" | "type";

const FilesScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useAppTheme();
  const items = useFilesStore((s) => s.items);
  const filter = useFilesStore((s) => s.filter);
  const loading = useFilesStore((s) => s.loading);
  const init = useFilesStore((s) => s.init);
  const setFilter = useFilesStore((s) => s.setFilter);
  const addSamples = useFilesStore((s) => s.addSamples);
  const deleteFile = useFilesStore((s) => s.deleteFile);
  const uploadFile = useFilesStore((s) => s.uploadFile);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  const filteredItems = (() => {
    let result = filter === "all"
      ? items
      : items.filter((f) => f.type === filter);

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "size":
          return (b.sizeBytes || 0) - (a.sizeBytes || 0);
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return result;
  })();

  const handleDelete = (fileId: string, fileName: string) => {
    Alert.alert(
      "Delete file",
      `Are you sure you want to delete "${fileName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFile(fileId);
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Failed to delete file");
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (fileId: string, fileName: string) => (
    <View style={styles.deleteContainer}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(fileId, fileName)}
      >
        <AppText style={styles.deleteText}>Delete</AppText>
      </TouchableOpacity>
    </View>
  );

  const handleUpload = async (pickerFn: () => Promise<import("../../services/filePicker").PickedFile | null>) => {
    setUploadModalVisible(false);
    try {
      const file = await pickerFn();
      if (file) {
        await uploadFile({
          name: file.name,
          type: file.type,
          sizeBytes: file.sizeBytes,
          uri: file.uri,
          tags: [],
        });
        Alert.alert("Success", "File uploaded successfully!");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <Screen>
      <AppText variant="title">Safety files</AppText>
      <AppText variant="small" muted style={{ marginTop: 4 }}>
        Store important documents, photos, and videos you may need during an
        emergency.
      </AppText>

      <View style={{ marginTop: 16, flexDirection: "row", gap: 8 }}>
        <AppButton
          title="📤 Upload File"
          onPress={() => setUploadModalVisible(true)}
          loading={loading}
          style={{ flex: 1 }}
        />
        <AppButton
          title="Add samples"
          onPress={addSamples}
          loading={loading}
          variant="secondary"
          style={{ flex: 1 }}
        />
      </View>

      {/* UPLOAD MODAL */}
      <Modal
        visible={uploadModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <AppText variant="title" style={{ marginBottom: 16 }}>Upload File</AppText>
            
            <AppButton
              title="📷 Take Photo"
              onPress={() => handleUpload(() => filePickerService.takePhoto())}
              style={{ marginBottom: 12 }}
            />
            
            <AppButton
              title="🖼️ Choose from Gallery"
              onPress={() => handleUpload(() => filePickerService.pickImage())}
              style={{ marginBottom: 12 }}
              variant="secondary"
            />
            
            <AppButton
              title="🎥 Pick Video"
              onPress={() => handleUpload(() => filePickerService.pickVideo())}
              style={{ marginBottom: 12 }}
              variant="secondary"
            />
            
            <AppButton
              title="📄 Pick Document"
              onPress={() => handleUpload(() => filePickerService.pickDocument())}
              style={{ marginBottom: 12 }}
              variant="secondary"
            />
            
            <AppButton
              title="Cancel"
              onPress={() => setUploadModalVisible(false)}
              variant="secondary"
            />
          </View>
        </View>
      </Modal>

      {/* SEARCH BAR */}
      <TextInput
        placeholder="Search files..."
        placeholderTextColor={theme.textMuted}
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={[
          styles.searchInput,
          {
            backgroundColor: theme.surface,
            borderColor: theme.cardBorder,
            color: theme.textPrimary,
          },
        ]}
      />

      {/* SORT OPTIONS */}
      <View style={styles.sortRow}>
        <AppText variant="small" muted>Sort by:</AppText>
        {(["name", "date", "size", "type"] as SortOption[]).map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setSortBy(option)}
            style={[
              styles.sortChip,
              {
                backgroundColor: sortBy === option ? colors.primary : "transparent",
                borderColor: sortBy === option ? colors.primary : theme.cardBorder,
              },
            ]}
          >
            <AppText
              variant="small"
              style={{
                color: sortBy === option ? "#fff" : theme.textMuted,
              }}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* FILTER CHIPS */}
      <View style={styles.filterRow}>
        {filterLabels.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
        key={f.key}
        style={[
          styles.filterChip,
          {
            // active chip: solid blue pill, white text
            backgroundColor: active ? colors.primary : "transparent",
            borderColor: active ? colors.primary : theme.cardBorder,
          },
        ]}
        onPress={() => setFilter(f.key)}
      >
        <AppText
          variant="small"
          style={{
            color: active ? "#ffffff" : theme.textMuted,
          }}
        >
          {f.label}
        </AppText>
      </TouchableOpacity>
          );
        })}
      </View>

      {/* FILE LIST */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="small" muted style={{ marginTop: 8 }}>
            Syncing safety files…
          </AppText>
        </View>
      )}

      {!loading && filteredItems.length === 0 && (
        <View style={styles.center}>
          <AppText style={{ marginBottom: 4 }}>No files yet</AppText>
          <AppText variant="small" muted>
            Add a few sample files to see how your emergency library will look.
          </AppText>
        </View>
      )}

      {!loading && filteredItems.length > 0 && (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          style={{ marginTop: 12 }}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => renderRightActions(item._id, item.name)}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("FileDetail", { fileId: item._id })
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.fileCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <AppText style={{ fontWeight: "600" }}>{item.name}</AppText>
                  <AppText variant="small" muted style={{ marginTop: 4 }}>
                    {item.type} · {item.sizeLabel}
                  </AppText>
                  {item.tags?.length ? (
                    <AppText variant="small" muted style={{ marginTop: 4 }}>
                      Tags: {item.tags.join(", ")}
                    </AppText>
                  ) : null}
                </View>
              </TouchableOpacity>
            </Swipeable>
          )}
        />
      )}

      {!loading && filteredItems.length === 0 && searchQuery && (
        <View style={styles.center}>
          <AppText style={{ marginBottom: 4 }}>No files found</AppText>
          <AppText variant="small" muted>
            Try adjusting your search or filters.
          </AppText>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  sortRow: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  fileCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  center: {
    marginTop: 32,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  deleteContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
});

export default FilesScreen;
