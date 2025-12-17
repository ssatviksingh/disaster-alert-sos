import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Screen from "../../components/common/Screen";
import AppText from "../../components/common/AppText";
import { colors } from "../../theme/colors";
import { useAppTheme } from "../../theme/useTheme";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const quickSearches = ["Earthquake", "Flood", "Passport", "Hospital", "Fire"];

type SearchResults = {
  alerts?: any[];
  sos?: any[];
  files?: any[];
};

const SearchScreen: React.FC = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;

    setQuery(term);
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await api.get(`/api/search?q=${encodeURIComponent(term)}`);
      setResults(res.data || {});
    } catch (e) {
      console.log("[Search] error", e);
      setResults({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <AppText variant="title">Search</AppText>
      <AppText variant="small" muted>
        Search alerts, SOS history and safety files.
      </AppText>

      {/* SEARCH BOX */}
      <View style={[styles.searchBox, { borderColor: theme.cardBorder }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search emergency data..."
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.textPrimary }]}
          onSubmitEditing={() => handleSearch()}
        />
        <TouchableOpacity onPress={() => handleSearch()} style={styles.goBtn}>
          <AppText style={{ color: "#fff", fontWeight: "600" }}>Go</AppText>
        </TouchableOpacity>
      </View>

      {/* QUICK SEARCH CHIPS */}
      <View style={styles.chipsRow}>
        {quickSearches.map((q) => (
          <TouchableOpacity
            key={q}
            onPress={() => handleSearch(q)}
            style={[styles.chip, { borderColor: theme.cardBorder }]}
          >
            <AppText variant="small">{q}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* RESULTS */}
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator />
            <AppText variant="small" muted>
              Searching…
            </AppText>
          </View>
        )}

        {!loading && hasSearched &&
          !results.alerts?.length &&
          !results.sos?.length &&
          !results.files?.length && (
            <View style={styles.center}>
              <AppText>No results found</AppText>
              <AppText variant="small" muted>
                Try another keyword
              </AppText>
            </View>
          )}

        {/* ALERT RESULTS */}
        {results.alerts?.length ? (
          <View style={styles.section}>
            <AppText variant="subtitle">Alerts</AppText>
            {results.alerts.map((a) => (
              <TouchableOpacity
                key={a._id}
                onPress={() =>
                  navigation.navigate("AlertDetail", { alertId: a._id })
                }
              >
                <View
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <AppText style={{ fontWeight: "600" }}>{a.title}</AppText>
                  <AppText variant="small" muted>
                    {a.location} · {a.severity?.toUpperCase()}
                  </AppText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* SOS RESULTS */}
        {results.sos?.length ? (
          <View style={styles.section}>
            <AppText variant="subtitle">SOS History</AppText>
            {results.sos.map((s) => (
              <View
                key={s._id}
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <AppText numberOfLines={2}>{s.message}</AppText>
                <AppText variant="small" muted>
                  Status: {s.status}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}

        {/* FILE RESULTS */}
        {results.files?.length ? (
          <View style={styles.section}>
            <AppText variant="subtitle">Files</AppText>
            {results.files.map((f) => (
              <TouchableOpacity
                key={f._id}
                onPress={() =>
                  navigation.navigate("FileDetail", { fileId: f._id })
                }
              >
                <View
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <AppText style={{ fontWeight: "600" }}>{f.name}</AppText>
                  <AppText variant="small" muted>
                    {f.type} · {f.sizeLabel}
                  </AppText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    marginTop: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  goBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  center: {
    marginTop: 32,
    alignItems: "center",
  },
  section: {
    marginTop: 20,
  },
  resultCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
});

export default SearchScreen;
