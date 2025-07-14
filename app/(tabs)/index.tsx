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
} from 'react-native';
import { MessageCircle, X } from 'lucide-react-native';
import { carouselData, AUTO_SCROLL_INTERVAL } from '@/constants/carouselData';
import { useCarousel, useMenuModal } from '@/hooks/useCarousel';
import ScreenLayout from '@/components/ScreenLayout';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import AppHeader from '@/components/AppHeader';
import Carousel from '@/components/Carousel';
import ChatInput from '@/components/ChatInput';
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
  const carousel = useCarousel(carouselData, AUTO_SCROLL_INTERVAL);
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
            <AppHeader onMenuPress={menuModal.handleMenuToggle} />
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Carousel
              data={carouselData}
              currentIndex={carousel.currentIndex}
              onIndexChange={carousel.setCurrentIndex}
              fadeAnim={carousel.fadeAnim}
              scaleAnim={carousel.scaleAnim}
            />
          </View>

          {/* Floating Chat Button */}
          <TouchableOpacity
            style={[styles.floatingChatButton, { backgroundColor: theme.colors.primary }]}
            onPress={chat.openChatModal}
            activeOpacity={0.8}
          >
            <MessageCircle size={28} color="white" />
            <View style={styles.chatButtonBadge}>
              <Text style={styles.badgeText}>AI</Text>
            </View>
          </TouchableOpacity>

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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
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