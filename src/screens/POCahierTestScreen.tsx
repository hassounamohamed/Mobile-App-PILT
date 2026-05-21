import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { projectsService } from "@/services/projects";
import { cahierTestsService } from "@/services/tests";
import type {
    CahierTestResponse,
    CasTestResponse,
    ProjetResponse,
} from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectWithCahier = {
  project: ProjetResponse;
  cahier: CahierTestResponse | null;
  loading: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUT_META: Record<string, { label: string; color: string }> = {
  ACTIF: { label: "Actif", color: "#22c55e" },
  ARCHIVE: { label: "Archivé", color: "#9ca3af" },
  TERMINE: { label: "Terminé", color: "#3b82f6" },
};

const CAHIER_STATUT: Record<string, { label: string; color: string }> = {
  BROUILLON: { label: "Brouillon", color: "#f59e0b" },
  VALIDE: { label: "Validé", color: "#22c55e" },
  ARCHIVE: { label: "Archivé", color: "#9ca3af" },
};

const CAS_META: Record<
  CasTestResponse["statut"],
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  NON_EXECUTE: {
    icon: "ellipse-outline",
    color: "#9ca3af",
    label: "À exécuter",
  },
  PASSE: { icon: "checkmark-circle", color: "#22c55e", label: "Passé" },
  ECHEC: { icon: "close-circle", color: "#ef4444", label: "Échoué" },
  BLOQUE: { icon: "warning", color: "#f59e0b", label: "Bloqué" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function POCahierTestScreen() {
  const c = useThemePalette();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ProjectWithCahier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function mergeProjects(
    primary: ProjetResponse[],
    secondary: ProjetResponse[],
  ) {
    const all: ProjetResponse[] = [...primary];
    for (const project of secondary) {
      if (!all.find((item) => item.id === project.id)) {
        all.push(project);
      }
    }
    return all;
  }

  async function load() {
    try {
      const [mine, member] = await Promise.allSettled([
        projectsService.getMine(),
        projectsService.getMember(),
      ]);

      const safe = mergeProjects(
        mine.status === "fulfilled" ? (mine.value ?? []) : [],
        member.status === "fulfilled" ? (member.value ?? []) : [],
      );

      // Init items with loading state
      setItems(safe.map((p) => ({ project: p, cahier: null, loading: true })));

      // Load each cahier in parallel
      const results = await Promise.allSettled(
        safe.map(async (p) => ({
          projectId: p.id,
          cahier: await cahierTestsService.getDetail(p.id),
        })),
      );

      setItems(
        safe.map((p) => {
          const res = results.find(
            (r) => r.status === "fulfilled" && r.value.projectId === p.id,
          );
          return {
            project: p,
            cahier: res?.status === "fulfilled" ? res.value.cahier : null,
            loading: false,
          };
        }),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggleExpand(projectId: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: insets.top + SIZES.lg,
        paddingHorizontal: SIZES.lg,
        paddingBottom: 140,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={c.primary}
        />
      }
    >
      {/* Header */}
      <View style={{ marginBottom: SIZES.lg }}>
        <Text
          style={{ color: c.text, fontSize: SIZES.font2xl, fontWeight: "800" }}
        >
          Cahiers de Test
        </Text>
        <Text
          style={{
            color: c.textSecondary,
            fontSize: SIZES.fontSm,
            marginTop: 2,
          }}
        >
          Vue lecture seule
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={c.primary} style={{ marginTop: SIZES.xxl }} />
      ) : items.length === 0 ? (
        <View
          style={{ alignItems: "center", paddingTop: SIZES.xxl, gap: SIZES.sm }}
        >
          <Ionicons
            name="clipboard-outline"
            size={52}
            color={c.textSecondary}
          />
          <Text
            style={{ color: c.text, fontSize: SIZES.fontLg, fontWeight: "600" }}
          >
            Aucun projet
          </Text>
        </View>
      ) : (
        items.map(({ project, cahier, loading: cahierLoading }) => {
          const psm = STATUT_META[project.statut] ?? {
            label: project.statut,
            color: c.textSecondary,
          };
          const isOpen = expanded.has(project.id);

          return (
            <View
              key={project.id}
              style={{
                backgroundColor: c.backgroundSecondary,
                borderRadius: SIZES.radiusLg,
                borderWidth: 1,
                borderColor: c.inputBorder,
                marginBottom: SIZES.md,
                overflow: "hidden",
              }}
            >
              {/* Project header row */}
              <TouchableOpacity
                onPress={() => cahier && toggleExpand(project.id)}
                activeOpacity={0.75}
                style={{ padding: SIZES.lg }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: SIZES.sm,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: SIZES.radiusMd,
                      backgroundColor: `${c.primary}22`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="folder" size={18} color={c.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: c.text,
                        fontSize: SIZES.fontBase,
                        fontWeight: "700",
                      }}
                      numberOfLines={1}
                    >
                      {project.nom}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 2,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: `${psm.color}22`,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: psm.color,
                            fontSize: 10,
                            fontWeight: "600",
                          }}
                        >
                          {psm.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {cahierLoading ? (
                    <ActivityIndicator size="small" color={c.primary} />
                  ) : cahier ? (
                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={c.textSecondary}
                    />
                  ) : (
                    <Text
                      style={{ color: c.textSecondary, fontSize: SIZES.fontXs }}
                    >
                      Aucun cahier
                    </Text>
                  )}
                </View>

                {/* Cahier summary (always visible when cahier exists) */}
                {cahier ? (
                  <View
                    style={{
                      marginTop: SIZES.md,
                      padding: SIZES.md,
                      backgroundColor: c.background,
                      borderRadius: SIZES.radiusMd,
                      borderWidth: 1,
                      borderColor: c.inputBorder,
                    }}
                  >
                    {/* Cahier title + statut */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: SIZES.sm,
                      }}
                    >
                      <Ionicons
                        name="clipboard-outline"
                        size={14}
                        color={c.textSecondary}
                      />
                      <Text
                        style={{
                          color: c.text,
                          fontSize: SIZES.fontSm,
                          fontWeight: "600",
                          flex: 1,
                          marginLeft: 6,
                        }}
                      >
                        {cahier.titre}
                      </Text>
                      {(() => {
                        const csm = CAHIER_STATUT[cahier.statut] ?? {
                          label: cahier.statut,
                          color: c.textSecondary,
                        };
                        return (
                          <View
                            style={{
                              backgroundColor: `${csm.color}22`,
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 4,
                            }}
                          >
                            <Text
                              style={{
                                color: csm.color,
                                fontSize: 10,
                                fontWeight: "600",
                              }}
                            >
                              {csm.label}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>

                    {/* Counters */}
                    <View style={{ flexDirection: "row", gap: SIZES.xl }}>
                      {[
                        {
                          label: "Total",
                          value: cahier.nb_cas_tests ?? 0,
                          color: c.text,
                        },
                        {
                          label: "Passés",
                          value: cahier.nb_passes ?? 0,
                          color: "#22c55e",
                        },
                        {
                          label: "Échecs",
                          value: cahier.nb_echecs ?? 0,
                          color: "#ef4444",
                        },
                      ].map((s) => (
                        <View
                          key={s.label}
                          style={{ alignItems: "center", gap: 1 }}
                        >
                          <Text
                            style={{
                              color: s.color,
                              fontSize: SIZES.fontLg,
                              fontWeight: "800",
                            }}
                          >
                            {s.value}
                          </Text>
                          <Text
                            style={{
                              color: c.textSecondary,
                              fontSize: SIZES.fontXs,
                            }}
                          >
                            {s.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
              </TouchableOpacity>

              {/* Expanded cas de test */}
              {isOpen && cahier?.cas_tests && cahier.cas_tests.length > 0 ? (
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: c.inputBorder,
                    paddingHorizontal: SIZES.lg,
                    paddingBottom: SIZES.lg,
                  }}
                >
                  <Text
                    style={{
                      color: c.textSecondary,
                      fontSize: SIZES.fontXs,
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginTop: SIZES.md,
                      marginBottom: SIZES.sm,
                    }}
                  >
                    Cas de test ({cahier.cas_tests.length})
                  </Text>
                  {cahier.cas_tests.map((cas, idx) => {
                    const meta = CAS_META[cas.statut] ?? CAS_META.NON_EXECUTE;
                    return (
                      <View
                        key={cas.id}
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          gap: SIZES.sm,
                          paddingVertical: SIZES.sm,
                          borderTopWidth: idx > 0 ? 1 : 0,
                          borderTopColor: c.inputBorder,
                        }}
                      >
                        <Ionicons
                          name={meta.icon}
                          size={16}
                          color={meta.color}
                          style={{ marginTop: 2 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{ color: c.text, fontSize: SIZES.fontSm }}
                          >
                            {cas.titre}
                          </Text>
                          {cas.description ? (
                            <Text
                              style={{
                                color: c.textSecondary,
                                fontSize: SIZES.fontXs,
                                marginTop: 2,
                              }}
                            >
                              {cas.description}
                            </Text>
                          ) : null}
                          {cas.resultat ? (
                            <Text
                              style={{
                                color: c.textSecondary,
                                fontSize: SIZES.fontXs,
                                marginTop: 2,
                                fontStyle: "italic",
                              }}
                            >
                              Résultat : {cas.resultat}
                            </Text>
                          ) : null}
                        </View>
                        <View
                          style={{
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 4,
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: `${meta.color}22`,
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 4,
                            }}
                          >
                            <Text
                              style={{
                                color: meta.color,
                                fontSize: 10,
                                fontWeight: "600",
                              }}
                            >
                              {meta.label}
                            </Text>
                          </View>
                          <Text
                            style={{ color: c.textSecondary, fontSize: 10 }}
                          >
                            {cas.type}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
