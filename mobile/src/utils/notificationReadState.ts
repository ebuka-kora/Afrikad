import AsyncStorage from '@react-native-async-storage/async-storage';

export const READ_NOTIFICATIONS_KEY = '@afrikad_read_notifications';

export async function getReadNotificationIds(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const ids = await getReadNotificationIds();
  if (ids.includes(id)) return;
  ids.push(id);
  await AsyncStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(ids));
}

/** Drop read entries for notifications that no longer exist (e.g. old tx rolled off the list). */
export async function pruneReadNotificationIds(validIds: readonly string[]): Promise<void> {
  const valid = new Set(validIds);
  const read = await getReadNotificationIds();
  const pruned = read.filter((id) => valid.has(id));
  if (pruned.length !== read.length) {
    await AsyncStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(pruned));
  }
}
