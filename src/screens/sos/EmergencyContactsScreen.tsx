// src/screens/sos/EmergencyContactsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import Screen from "../../components/common/Screen";
import AppText from "../../components/common/AppText";
import AppButton from "../../components/common/AppButton";
import { useSettingsStore } from "../../store/settingsStore";
import { useAppTheme } from "../../theme/useTheme";

const EmergencyContactsScreen: React.FC = () => {
  const theme = useAppTheme();

  const { contacts, initContacts, addContact, removeContact } = useSettingsStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");

  useEffect(() => {
    // defensive init
    if (typeof initContacts === "function") {
      initContacts().catch((e) => console.warn("[EmergencyContacts] initContacts failed", e));
    }
  }, [initContacts]);

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Missing info", "Please enter both name and phone number.");
      return;
    }
    try {
      if (typeof addContact === "function") {
        await addContact({
          name: name.trim(),
          phone: phone.trim(),
          relation: relation.trim() || undefined,
        });
      } else {
        console.warn("[EmergencyContacts] addContact not available on settingsStore");
      }
      setName("");
      setPhone("");
      setRelation("");
    } catch (e) {
      console.error("[EmergencyContacts] addContact error", e);
      Alert.alert("Error", "Failed to add contact.");
    }
  };

  const handleRemove = (id: string) => {
    Alert.alert(
      "Remove contact",
      "Are you sure you want to remove this emergency contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              if (typeof removeContact === "function") {
                await removeContact(id);
              } else {
                console.warn("[EmergencyContacts] removeContact not available");
              }
            } catch (e) {
              console.error("[EmergencyContacts] removeContact error", e);
              Alert.alert("Error", "Failed to remove contact.");
            }
          },
        },
      ],
    );
  };

  const handleCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Unable to call", "Phone calls are not supported on this device.");
    });
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <Screen>
      <AppText variant="title">Emergency contacts</AppText>
      <AppText variant="small" muted>
        These people will be notified and contacted when you send an SOS (once backend is connected).
        Add close family or trusted friends.
      </AppText>

      {/* Add form */}
      <View style={styles.form}>
        <TextInput
          placeholder="Name"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={setName}
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: theme.cardBorder,
              color: theme.textPrimary,
            },
          ]}
        />
        <TextInput
          placeholder="Phone number"
          placeholderTextColor={theme.textMuted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: theme.cardBorder,
              color: theme.textPrimary,
            },
          ]}
        />
        <TextInput
          placeholder="Relation (e.g. Mother, Friend)"
          placeholderTextColor={theme.textMuted}
          value={relation}
          onChangeText={setRelation}
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: theme.cardBorder,
              color: theme.textPrimary,
            },
          ]}
        />
        <AppButton title="Add contact" onPress={handleAdd} />
      </View>

      {/* List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText muted>No emergency contacts yet.</AppText>
            <AppText variant="small" muted style={{ marginTop: 4, textAlign: "center" }}>
              Add at least one trusted person so they can receive your SOS alerts.
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={styles.leftRow}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: theme.primary,
                  },
                ]}
              >
                <AppText style={styles.avatarText}>
                  {getInitials(item.name)}
                </AppText>
              </View>

              <View style={{ flex: 1 }}>
                <AppText variant="subtitle" numberOfLines={1}>
                  {item.name}
                </AppText>
                <AppText variant="small" muted numberOfLines={1}>
                  {item.phone}
                  {item.relation ? ` • ${item.relation}` : ""}
                </AppText>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={() => handleCall(item.phone)}
              >
                <AppText variant="small" style={styles.callText}>
                  Call
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.removeButton]}
                onPress={() => handleRemove(item.id)}
              >
                <AppText variant="small" style={styles.removeText}>
                  Remove
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  form: {
    marginTop: 12,
    gap: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  empty: {
    padding: 24,
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  callButton: {
    borderColor: "#0369a1",
  },
  removeButton: {
    borderColor: "#dc2626",
  },
  callText: {
    color: "#0369a1",
  },
  removeText: {
    color: "#dc2626",
  },
});

export default EmergencyContactsScreen;
