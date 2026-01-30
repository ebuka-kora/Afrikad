import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { apiService } from '../../services/api';
import { Toast } from '../../components/ui/Toast';

interface ChatMessage {
  id: string;
  message: string;
  timestamp: string;
  sender: 'user' | 'support';
}

export const LiveChatScreen = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await apiService.getChatHistory();
      if (response.success && Array.isArray(response.messages)) {
        setMessages(response.messages);
      }
    } catch (err: any) {
      console.error('Error loading chat history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const messageText = message.trim();
    setLoading(true);
    setError('');
    
    // Optimistically add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: messageText,
      timestamp: new Date().toISOString(),
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      const response = await apiService.sendChatMessage(messageText);
      if (response.success) {
        // Reload chat history to get any support response
        await loadChatHistory();
      } else {
        setError(response.message || 'Failed to send message');
        setShowToast(true);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        setMessage(messageText);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to send message');
      setShowToast(true);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setMessage(messageText);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <ImageBackground
      source={require('../../../assets/bgi.png')}
      style={styles.backgroundImage}
      resizeMode="center"
      imageStyle={styles.imageStyle}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" library="ionicons" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Live Chat</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loadingHistory ? (
              <Card style={styles.infoCard}>
                <Text style={styles.infoSubtitle}>Loading chat history...</Text>
              </Card>
            ) : messages.length === 0 ? (
              <>
                <Card style={styles.infoCard}>
                  <View style={styles.infoIcon}>
                    <Icon name="chatbubbles-outline" library="ionicons" size={40} color={COLORS.accent} />
                  </View>
                  <Text style={styles.infoTitle}>Chat with support</Text>
                  <Text style={styles.infoSubtitle}>
                    Send a message and our team will reply as soon as possible. We typically respond
                    within a few hours during business hours.
                  </Text>
                </Card>
                <Card style={styles.placeholderCard}>
                  <Text style={styles.placeholderTitle}>No messages yet</Text>
                  <Text style={styles.placeholderSubtitle}>
                    Type your question below and tap Send to start the conversation.
                  </Text>
                </Card>
              </>
            ) : (
              messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageContainer,
                    msg.sender === 'user' ? styles.userMessage : styles.supportMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{msg.message}</Text>
                  <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={COLORS.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              editable
            />
            <TouchableOpacity
              style={[styles.sendButton, (!message.trim() || loading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!message.trim() || loading}
              activeOpacity={0.8}
            >
              <Icon
                name="send"
                library="ionicons"
                size={22}
                color={message.trim() ? COLORS.text : COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {showToast && (
          <Toast
            message={error}
            type="error"
            visible={showToast}
            onHide={() => setShowToast(false)}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageStyle: {
    width: '107%',
    height: '110%',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  infoCard: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  infoIcon: {
    marginBottom: SPACING.md,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  infoSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  placeholderCard: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  placeholderTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  placeholderSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
  },
  messageContainer: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.accent,
  },
  supportMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(77, 98, 80, 0.30)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    alignSelf: 'flex-end',
  },
});
