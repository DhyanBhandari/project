import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Animated,
  Image,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useMenuModal } from '@/hooks/useModal';
import ScreenLayout from '@/components/ScreenLayout';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import SimpleChatInput from '@/components/SimpleChatInput';
import MenuModal from '@/components/MenuModal';
import { useTheme } from '@/context/ThemeContext';

// Enhanced hook for chat functionality with modal state
function useSimpleChat() {
  const [chatText, setChatText] = React.useState('');
  const [isChatModalOpen, setIsChatModalOpen] = React.useState(false);
  const chatModalAnim = React.useRef(new Animated.Value(0)).current;
  const backdropAnim = React.useRef(new Animated.Value(0)).current;

  const handleSubmit = () => {
    if (chatText.trim()) {
      console.log('Sending message:', chatText);
      setChatText('');
    }
  };

  const openChatModal = () => {
    setIsChatModalOpen(true);
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(chatModalAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  };

  const closeChatModal = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(chatModalAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsChatModalOpen(false);
    });
  };

  return { 
    chatText, 
    setChatText, 
    handleSubmit,
    isChatModalOpen,
    openChatModal,
    closeChatModal,
    chatModalAnim,
    backdropAnim,
  };
}

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { theme } = useTheme();
  const chat = useSimpleChat();
  const menuModal = useMenuModal();

  return (
    <ScreenLayout>
      <BackgroundWrapper>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoSection}>
              <Image
                source={require('@/assets/images/logo-supe.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            
            {/* Fixed Menu Button */}
            <TouchableOpacity 
              onPress={menuModal.handleMenuToggle} 
              style={styles.fixedMenuButton}
            >
              <View style={styles.menuButtonContent}>
                <Text style={[styles.menuButtonText, { color: theme.colors.text }]}>Menu</Text>
                <View style={styles.menuIcon}>
                  <View style={[styles.menuLine, { backgroundColor: theme.colors.text }]} />
                  <View style={[styles.menuLine, { backgroundColor: theme.colors.text }]} />
                  <View style={[styles.menuLine, { backgroundColor: theme.colors.text }]} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <View style={styles.welcomeContainer}>
              <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
                Welcome to Your App
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: theme.colors.text, opacity: 0.7 }]}>
                Start exploring and chatting below
              </Text>
            </View>
          </View>

          {/* Simple Chat Input - Still available at bottom */}
          <View style={styles.chatSection}>
            <SimpleChatInput />
          </View>
        </KeyboardAvoidingView>
      </BackgroundWrapper>

      {/* Chat Modal */}
      {chat.isChatModalOpen && (
        <View style={styles.chatModalContainer}>
          {/* Backdrop */}
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: chat.backdropAnim,
              },
            ]}
          />
          
          <Animated.View
            style={[
              styles.chatModal,
              {
                transform: [
                  {
                    translateY: chat.chatModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Close Button */}
            <View style={styles.chatModalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={chat.closeChatModal}
              >
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      <MenuModal
        visible={menuModal.menuVisible}
        onClose={menuModal.handleMenuToggle}
        userModeDropdown={menuModal.userModeDropdown}
        setUserModeDropdown={menuModal.setUserModeDropdown}
        currentMode={menuModal.currentMode}
        onModeSwitch={menuModal.handleModeSwitch}
        menuAnimation={menuModal.menuAnimation}
        backdropAnimation={menuModal.backdropAnimation}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    zIndex: 100,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    width: 100,
    height: 100,
  },
  fixedMenuButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  menuButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuIcon: {
    width: 18,
    height: 12,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  chatSection: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  floatingChatButton: {
    position: 'absolute',
    bottom: 120, // Above the simple chat input
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 200,
  },
  chatButtonBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  chatModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chatModal: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  chatModalHeader: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 1001,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});